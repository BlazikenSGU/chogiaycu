import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService
    ) { }

    private hashToken(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }

    private async issueToken(user: {
        id: string;
        email: string;
        role: string;
    }) {
        const accessToken = await this.jwt.signAsync(
            {
                sub: user.id, email: user.email, role: user.role
            },
            {
                secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
                expiresIn: 900,
            },
        );

        const refreshToken = randomBytes(32).toString('hex');
        const refreshDays = Number(
            this.config.get<string>('JWT_REFRESH_EXPIRES_DAYS', '7')
        );

        await this.prisma.refreshSession.create({
            data: {
                userId: user.id,
                tokenHash: this.hashToken(refreshToken),
                expiresAt: new Date(Date.now() + refreshDays * 86400000)
            },
        });

        return { accessToken, refreshToken };
    }

    async register(dto: RegisterDto) {
        const email = dto.email.toLowerCase();
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            throw new ConflictException('Email đã được sử dụng');
        }

        const password = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email,
                password,
                name: dto.name,
                role: 'CUSTOMER',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        const tokens = await this.issueToken(user);
        return { user, ...tokens };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.trim().toLowerCase() },
        });

        if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        const tokens = await this.issueToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            ...tokens
        };
    }


    async refresh(refreshToken: string) {
        const hash = this.hashToken(refreshToken);
        const now = new Date();

        const session = await this.prisma.refreshSession.findUnique({
            where: { tokenHash: hash },
            include: { user: true },
        });

        if (!session || session.revokedAt || session.expiresAt < new Date() || !session.user.isActive) {
            throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
        }

        const result = await this.prisma.refreshSession.updateMany({
            where: {
                id: session.id,
                revokedAt: null,
                expiresAt: { gt: now },
            },
            data: {
                revokedAt: now,
            },
        });

        if (result.count !== 1) {
            throw new UnauthorizedException('Refresh Token đã được sử dụng');
        }

        return this.issueToken(session.user);
    }

    async logout(refreshToken: string) {
        await this.prisma.refreshSession.updateMany({
            where: { tokenHash: this.hashToken(refreshToken) },
            data: { revokedAt: new Date() },
        });

        return { message: 'Đăng xuất thành công' };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Tài khoản không tồn tại');
        }

        return user;
    }

    async updateProfile(
        userId: string,
        dto: UpdateProfileDto,
    ) {
        const name = dto.name.trim();

        if (name.length < 2 || name.length > 100) {
            throw new BadRequestException('Họ và tên phải từ 2 đến 100 ký tự');
        };

        const user = await this.prisma.user.updateMany({
            where: {
                id: userId,
                isActive: true,
            },
            data: {
                name,
            },
        });

        if (user.count != 1) {
            throw new UnauthorizedException('Tài khoản không tồn tại hoặc bị vô hiệu hóa');
        }

        return this.getProfile(userId);
    }

    async changePassword(
        userId: string,
        dto: ChangePasswordDto
    ) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            throw new BadRequestException('Tài khoản không hợp lệ');
        }

        const isPasswordValid = await bcrypt.compare(
            dto.currentPassword,
            user.password
        );

        if (!isPasswordValid) {
            throw new BadRequestException('Mật khẩu hiện tại không đúng');
        }

        if (dto.currentPassword === dto.newPassword) {
            throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại');
        }

        if (Buffer.byteLength(dto.newPassword, 'utf-8') > 72) {
            throw new BadRequestException('Mật khẩu mới không được vượt quá 72 byte UTF-8');
        }

        const hashedPassword = await bcrypt.hash(
            dto.newPassword,
            12
        );

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    password: hashedPassword,
                },
            }),

            this.prisma.refreshSession.updateMany({
                where: {
                    userId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            }),
        ]);

        return {
            message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
        }
    }
}
