
import {
    Injectable,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { Prisma } from '../../generated/prisma/client.js';

type RateLimitAction = 'login' | 'forgot' | 'register' | 'verify-email';
type RateLimitScope = 'email' | 'ip';

type RateLimitKey = {
    action: RateLimitAction;
    scope: RateLimitScope;
    value: string;
};

type RateLimitState = {
    attempts: number;
    lockLevel: number;
    lockedUntil: Date | null;
    lastAttempt: Date;
};

type ViolationResult = {
    locked: boolean;
    retryAfter: number;
};

@Injectable()
export class AuthRateLimitService {
    private readonly loginLockMinutes = [5, 30, 60, 360];
    constructor(private readonly prisma: PrismaService) { }
    private readonly resetAfterMs = 24 * 60 * 60 * 1000;

    private makeKey(input: RateLimitKey): string {
        const normalized = input.value.trim().toLowerCase();

        const hash = createHash('sha256')
            .update(normalized)
            .digest('hex');

        return `${input.action}:${input.scope}:${hash}`;
    }

    private getPolicy(input: RateLimitKey) {
        if (input.action === 'forgot') {
            return {
                maxAttempts: input.scope === 'ip' ? 20 : 5,
                resetAfterMs: 60 * 60_000,
            };
        }

        return {
            maxAttempts: input.scope === 'ip' ? 20 : 5,
            resetAfterMs: 24 * 60 * 60_000,
        };
    }

    private getLockDuration(input: RateLimitKey, level: number): number {
        if (input.action === 'forgot') {
            return 60 * 60_000;
        }

        const index = Math.min(
            Math.max(level - 1, 0),
            this.loginLockMinutes.length - 1,
        );

        return this.loginLockMinutes[index] * 60_000;
    }

    private throwIfLocked(
        state: RateLimitState | null,
        now: Date,
    ): void {
        if (!state?.lockedUntil) return;

        const remainingMs =
            state.lockedUntil.getTime() - now.getTime();

        if (remainingMs <= 0) return;

        throw new HttpException(
            {
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
                message: 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.',
                retryAfter: Math.ceil(remainingMs / 1000),
            },
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }

    private isExpired(
        state: RateLimitState,
        now: Date,
    ): boolean {
        return (
            now.getTime() - state.lastAttempt.getTime()
            >= this.resetAfterMs
        );
    }

    async check(input: RateLimitKey): Promise<void> {
        const key = this.makeKey(input);

        const state = await this.prisma.authRateLimit.findUnique({
            where: { key }
        });

        this.throwIfLocked(state, new Date());
    }

    async recordViolation(input: RateLimitKey): Promise<ViolationResult> {
        const key = this.makeKey(input);
        const policy = this.getPolicy(input);

        const outcome = await this.prisma.$transaction(
            async (tx) => {
                await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(
            hashtextextended(${key}, 0)
          )
        `;

                const now = new Date();

                const current = await tx.authRateLimit.findUnique({
                    where: { key },
                });

                if (
                    current?.lockedUntil &&
                    current.lockedUntil > now
                ) {
                    return {
                        locked: true,
                        retryAfter: Math.ceil(
                            (current.lockedUntil.getTime() - now.getTime()) / 1000,
                        )
                    };
                }

                const expired =
                    !current ||
                    now.getTime() - current.lastAttempt.getTime() >=
                    policy.resetAfterMs;

                const attempts = expired
                    ? 1
                    : current.attempts + 1;

                const previousLevel = expired
                    ? 0
                    : current.lockLevel;

                const shouldLock =
                    attempts >= policy.maxAttempts;

                const lockLevel = shouldLock
                    ? previousLevel + 1
                    : previousLevel;

                const lockedUntil = shouldLock
                    ? new Date(
                        now.getTime() +
                        this.getLockDuration(input, lockLevel),
                    )
                    : null;

                await tx.authRateLimit.upsert({
                    where: { key },
                    create: {
                        key,
                        attempts: shouldLock ? 0 : attempts,
                        lockLevel,
                        lockedUntil,
                        lastAttempt: now,
                    },
                    update: {
                        attempts: shouldLock ? 0 : attempts,
                        lockLevel,
                        lockedUntil,
                        lastAttempt: now,
                    },
                });

                return {
                    locked: shouldLock,
                    retryAfter: lockedUntil
                        ? Math.ceil(
                            (lockedUntil.getTime() -
                                now.getTime()) / 1000,
                        )
                        : 0,
                };
            },
            {
                maxWait: 5000,
                timeout: 10000,
            },
        );
        return outcome;
    }

    async consumeRegisterSlot(
        tx: Prisma.TransactionClient,
        ip: string,
    ): Promise<void> {
        const key = this.makeKey({
            action: 'register',
            scope: 'ip',
            value: ip,
        });

        await tx.$executeRaw`
            SELECT pg_advisory_xact_lock(
                hashtextextended(${key}, 0)
            )
        `;

        const now = new Date();
        const windowMs = 24 * 60 * 60 * 1000;
        const maxAccounts = 5;

        const current = await tx.authRateLimit.findUnique({
            where: { key },
        });

        const windowStart = current?.createdAt ?? now;
        const windowEnd = new Date(
            windowStart.getTime() + windowMs,
        );

        const expired =
            !current || now >= windowEnd;

        const attempts = expired
            ? 0
            : current.attempts;

        if (attempts >= maxAccounts) {
            const retryAfter = Math.max(
                1,
                Math.ceil(
                    (windowEnd.getTime() - now.getTime()) / 1000,
                ),
            );

            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message:
                        'Bạn đã đạt giới hạn 5 tài khoản đăng ký trong 24 giờ.',
                    retryAfter,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        if (expired) {
            await tx.authRateLimit.upsert({
                where: { key },
                create: {
                    key,
                    attempts: 1,
                    lockLevel: 0,
                    lockedUntil: null,
                    lastAttempt: now,
                    createdAt: now,
                },
                update: {
                    attempts: 1,
                    lockLevel: 0,
                    lockedUntil: null,
                    lastAttempt: now,
                    createdAt: now,
                },
            });
        } else {
            await tx.authRateLimit.update({
                where: { key },
                data: {
                    attempts: { increment: 1 },
                    lastAttempt: now,
                },
            });
        }
    }

    async consumeForgotRequest(
        email: string,
        ip: string,
        action: 'forgot' | 'verify-email' = 'forgot',
    ): Promise<void> {
        const emailKey = this.makeKey({
            action,
            scope: 'email',
            value: email,
        });

        const ipKey = this.makeKey({
            action,
            scope: 'ip',
            value: ip,
        });

        const isVerification = action === 'verify-email';

        const maxEmailRequests = isVerification ? 3 : 5;
        const maxIpRequests = isVerification ? 5 : 20;

        const dayMs = 24 * 60 * 60 * 1000;
        const cooldownMs = 60 * 1000;

        const result = await this.prisma.$transaction(
            async (tx) => {
                // Khóa cả hai bộ đếm theo thứ tự cố định.
                // Tránh request đồng thời vượt hạn mức.
                for (const key of [emailKey, ipKey].sort()) {
                    await tx.$executeRaw`
                    SELECT pg_advisory_xact_lock(
                        hashtextextended(${key}, 0)
                    )
                `;
                }

                const now = new Date();

                const emailState =
                    await tx.authRateLimit.findUnique({
                        where: { key: emailKey },
                    });

                const ipState =
                    await tx.authRateLimit.findUnique({
                        where: { key: ipKey },
                    });

                const emailExpired =
                    !emailState ||
                    now.getTime() -
                    emailState.createdAt.getTime() >= dayMs;

                const ipExpired =
                    !ipState ||
                    now.getTime() -
                    ipState.createdAt.getTime() >= dayMs;

                const emailCount = emailExpired
                    ? 0
                    : emailState.attempts;

                const ipCount = ipExpired
                    ? 0
                    : ipState.attempts;

                let retryAfter = 0;
                let code = '';
                let message = '';

                // Một email tối đa 5 yêu cầu / 24 giờ. gửi lại email xác thực thì 3 / 24h
                if (emailCount >= maxEmailRequests && emailState) {
                    const remaining =
                        emailState.createdAt.getTime() +
                        dayMs -
                        now.getTime();

                    retryAfter = Math.max(
                        1,
                        Math.ceil(remaining / 1000),
                    );

                    code = isVerification ? 'VERIFY_EMAIL_DAILY_EMAIL_LIMIT' : 'FORGOT_DAILY_EMAIL_LIMIT';
                    message = isVerification ? `Bạn đã đạt giới hạn ${maxEmailRequests} yêu cầu xác thực email trong 24 giờ.`
                        : `Bạn đã đạt giới hạn ${maxEmailRequests} yêu cầu đặt lại mật khẩu trong 24 giờ.`;
                }

                // Một IP tối đa 20 yêu cầu / 24 giờ. Yêu cầu gửi lại mail xác thực là 5/ 24h
                if (ipCount >= maxIpRequests && ipState) {
                    const remaining =
                        ipState.createdAt.getTime() +
                        dayMs -
                        now.getTime();

                    const ipRetryAfter = Math.max(
                        1,
                        Math.ceil(remaining / 1000),
                    );

                    if (ipRetryAfter > retryAfter) {
                        retryAfter = ipRetryAfter;
                        code = isVerification
                            ? 'VERIFY_EMAIL_DAILY_IP_LIMIT'
                            : 'FORGOT_DAILY_IP_LIMIT';
                        message =
                            'Có quá nhiều yêu cầu từ mạng của bạn. Vui lòng thử lại sau.';
                    }
                }

                if (retryAfter === 0 && !emailExpired && emailState) {
                    const remaining =
                        emailState.lastAttempt.getTime() +
                        cooldownMs -
                        now.getTime();

                    const cooldownRemaining = Math.max(
                        retryAfter,
                        Math.ceil(remaining / 1000),
                    );

                    if (cooldownRemaining > 0) {
                        retryAfter = cooldownRemaining;
                        code = isVerification
                            ? 'VERIFY_EMAIL_COOLDOWN'
                            : 'FORGOT_COOLDOWN';

                        message = isVerification
                            ? 'Vui lòng đợi 60 giây giữa các yêu cầu xác thực email.'
                            : 'Vui lòng đợi 60 giây giữa các yêu cầu đặt lại mật khẩu.';
                    }
                }

                if (retryAfter > 0) {
                    return {
                        retryAfter,
                        code,
                        message,
                    };
                }

                await tx.authRateLimit.upsert({
                    where: { key: emailKey },
                    create: {
                        key: emailKey,
                        attempts: 1,
                        lockLevel: 0,
                        lockedUntil: null,
                        lastAttempt: now,
                        createdAt: now,
                    },
                    update: emailExpired
                        ? {
                            attempts: 1,
                            lockLevel: 0,
                            lockedUntil: null,
                            lastAttempt: now,
                            createdAt: now,
                        }
                        : {
                            attempts: { increment: 1 },
                            lastAttempt: now,
                        },
                });

                await tx.authRateLimit.upsert({
                    where: { key: ipKey },
                    create: {
                        key: ipKey,
                        attempts: 1,
                        lockLevel: 0,
                        lockedUntil: null,
                        lastAttempt: now,
                        createdAt: now,
                    },
                    update: ipExpired
                        ? {
                            attempts: 1,
                            lockLevel: 0,
                            lockedUntil: null,
                            lastAttempt: now,
                            createdAt: now,
                        }
                        : {
                            attempts: { increment: 1 },
                            lastAttempt: now,
                        },
                });

                return {
                    retryAfter: 0,
                    code: '',
                    message: '',
                };
            },
            {
                maxWait: 5000,
                timeout: 10000,
            },
        );

        if (result.retryAfter > 0) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    code: result.code,
                    message: result.message,
                    retryAfter: result.retryAfter,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }


    async reset(input: RateLimitKey): Promise<void> {
        const key = this.makeKey(input);

        await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(
          hashtextextended(${key}, 0)
        )
      `;

            await tx.authRateLimit.deleteMany({
                where: { key },
            });
        });
    }


}
