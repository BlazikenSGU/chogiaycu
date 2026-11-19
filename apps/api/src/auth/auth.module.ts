import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { MailModule } from '../mail/mail.module.js';
import { AuthRateLimitService } from './rate-limit/auth-rate-limit.service.js';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    AuthRateLimitService,
  ],
  imports: [
    JwtModule.register({}),
    MailModule,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    JwtModule,
    RolesGuard,
  ],
})
export class AuthModule { }
