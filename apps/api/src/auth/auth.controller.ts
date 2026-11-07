import {
    Controller,
    Body,
    Get,
    Post,
    Req,
    Res,
    Patch,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

import { Roles } from './decorators/roles.decorator.js';
import { UserRole } from '../generated/prisma/enums.js';
import { RolesGuard } from './guards/roles.guard.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) { }

    private cookieOptions() {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/api/v1/auth',
            maxAge: 7 * 86400000,
        };
    }

    @Post('register')
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { refreshToken, ...result } = await this.auth.register(dto);
        res.cookie('refresh_token', refreshToken, this.cookieOptions());
        return result;
    }

    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { refreshToken, ...result } = await this.auth.login(dto);
        res.cookie('refresh_token', refreshToken, this.cookieOptions());
        return result;
    }

    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const token = req.cookies?.refresh_token as string | undefined;
        if (!token) {
            throw new UnauthorizedException();
        }

        const { refreshToken, ...result } = await this.auth.refresh(token);
        res.cookie('refresh_token', refreshToken, this.cookieOptions());
        return result;
    }

    @Post('logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = req.cookies?.refresh_token as string | undefined;
        if (token) await this.auth.logout(token);

        res.clearCookie('refresh_token', {
            path: '/api/v1/auth',
        });

        return { message: 'Đăng xuất thành công' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(
        @Req() req: Request & {
            user: { id: string };
        },
    ) {
        return this.auth.getProfile(req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('admin-check')
    adminCheck() {
        return {
            message: 'Bạn có quyền admin',
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch('me')
    async updateProfile(
        @Req() req: Request & {
            user: { id: string },
        },
        @Body() dto: UpdateProfileDto,
    ) {
        return this.auth.updateProfile(
            req.user.id,
            dto,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch('change-password')
    async changePassword(
        @Req() req: Request & {
            user: { id: string };
        },
        @Body() dto: ChangePasswordDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.auth.changePassword(
            req.user.id,
            dto
        );

        res.clearCookie('refresh_token', {
            path: '/api/v1/auth',
        });

        return result;
    }
}
