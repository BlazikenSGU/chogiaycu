
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Access token không tồn tại',
      );
    }

    const token = authHeader.slice(7);

    try {
      const payload =
        await this.jwt.verifyAsync<JwtPayload>(
          token,
          {
            secret:
              this.config.getOrThrow<string>(
                'JWT_ACCESS_SECRET',
              ),
          },
        );

      if (
        !payload ||
        typeof payload.sub !== 'string'
      ) {
        throw new UnauthorizedException();
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user?.isActive) {
        throw new UnauthorizedException(
          'Tài khoản không tồn tại hoặc bị khóa',
        );
      }

      (
        request as Request & {
          user: typeof user;
        }
      ).user = user;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Access token không hợp lệ hoặc hết hạn',
      );
    }
  }
}
