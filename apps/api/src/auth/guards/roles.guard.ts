import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { UserRole } from '../../generated/prisma/enums.js';
import type { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles?.length) {
            return true;
        }

        const request = context.switchToHttp().getRequest<
            Request & { user?: { id: string, role: UserRole } }
        >();

        if (
            !request.user ||
            !requiredRoles.includes(request.user.role)
        ) {
            throw new ForbiddenException(
                'Bạn không có quyền truy cập vào tài nguyên này',
            );
        }

        return true;
    }
}