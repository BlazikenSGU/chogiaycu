
import {
    Injectable,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';

type RateLimitAction = 'login' | 'forgot';
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
