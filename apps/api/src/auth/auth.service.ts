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
import { MailService } from '../mail/mail.service.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
        private readonly mail: MailService,
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

    async forgotPassword(email: string) {
        const message = 'Nếu email đã đăng ký, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu';
        const normalizedEmail = email.trim().toLocaleLowerCase();

        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user || !user.isActive) {
            return { message };
        }

        const token = randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(token);
        const now = new Date();

        const recentToken = await this.prisma.passwordResetToken.findFirst({
            where: {
                userId: user.id,
                createdAt: {
                    gt: new Date(now.getTime() - 60_000),
                },
            },
        });

        if (recentToken) {
            return { message };
        }

        await this.prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });

        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(now.getTime() + 15 * 60_000),
            },
        });

        const frontendUrl = this.config
            .getOrThrow<string>('FRONTEND_URL')
            .replace(/\/+$/, '');

        const resetUrl =
            `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

        try {
            console.log('[MAIL] Starting SMTP send');

            await this.mail.sendResetPasswordEmail(
                user.email,
                resetUrl,
            );

            console.log('[MAIL] SMTP send completed');
        } catch (error) {
            console.error('[MAIL] SMTP send failed:', error);
        }

        return { message };

    }

    async resetPassword(
        token: string,
        newPassword: string,
        confirmPassword: string,
    ) {
        if (newPassword !== confirmPassword) {
            throw new BadRequestException(
                'Xác nhận mật khẩu không khớp',
            );
        }

        if (
            newPassword.length < 8 ||
            newPassword.length > 72 ||
            Buffer.byteLength(newPassword, 'utf8') > 72
        ) {
            throw new BadRequestException(
                'Mật khẩu phải từ 8 đến 72 ký tự và không quá 72 byte UTF-8',
            );
        }

        if (!/^[a-f0-9]{64}$/i.test(token)) {
            throw new BadRequestException(
                'Link đặt lại mật khẩu không hợp lệ',
            );
        }

        const tokenHash = this.hashToken(token);
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const now = new Date();

        await this.prisma.$transaction(async (tx) => {
            const resetToken = await tx.passwordResetToken.findUnique({
                where: { tokenHash },
                include: { user: true },
            });

            if (
                !resetToken ||
                resetToken.usedAt ||
                resetToken.expiresAt <= now ||
                !resetToken.user.isActive
            ) {
                throw new BadRequestException(
                    'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
                );
            }

            const claimed = await tx.passwordResetToken.updateMany({
                where: {
                    id: resetToken.id,
                    usedAt: null,
                    expiresAt: { gt: now },
                },
                data: { usedAt: now },
            });

            if (claimed.count !== 1) {
                throw new BadRequestException(
                    'Link đặt lại mật khẩu đã được sử dụng',
                );
            }

            await tx.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword },
            });

            await tx.refreshSession.updateMany({
                where: {
                    userId: resetToken.userId,
                    revokedAt: null,
                },
                data: { revokedAt: now },
            });

            await tx.passwordResetToken.deleteMany({
                where: {
                    userId: resetToken.userId,
                    id: { not: resetToken.id },
                },
            });
        });

        return {
            message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.',
        };
    }

}
