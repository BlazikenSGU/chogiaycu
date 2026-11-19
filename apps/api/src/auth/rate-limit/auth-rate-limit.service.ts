
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

@Injectable()
export class AuthRateLimitService {
    private readonly maxAttempts = 5;
    private readonly resetAfterMs = 24 * 60 * 60 * 1000;

    private readonly lockMinutes = [5, 15, 60, 360];

    constructor(private readonly prisma: PrismaService) { }

    private makeKey(input: RateLimitKey): string {
        const normalized = input.value.trim().toLowerCase();

        const hash = createHash('sha256')
            .update(normalized)
            .digest('hex');

        return `${input.action}:${input.scope}:${hash}`;
    }

    private getLockDuration(level: number): number {
        const index = Math.min(
            Math.max(level - 1, 0),
            this.lockMinutes.length - 1,
        );

        return this.lockMinutes[index] * 60_000;
    }

    private throwIfLocked(
        state: RateLimitState | null,
        now: Date,
    ): void {
        if (!state?.lockedUntil) return;

        const remainingMs =
            state.lockedUntil.getTime() - now.getTime();

        if (remainingMs <= 0) return;

        const seconds = Math.ceil(remainingMs / 1000);

        throw new HttpException(
            {
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
                message: 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.',
                retryAfter: seconds,
            },
            HttpStatus.TOO_MANY_REQUESTS,
            {
                cause: 'AUTH_RATE_LIMITED',
            },
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
            where: { key },
        });

        this.throwIfLocked(state, new Date());
    }

    async recordViolation(input: RateLimitKey): Promise<void> {
        const key = this.makeKey(input);

        const outcome = await this.prisma.$transaction(
            async (tx) => {
                // Serialize operations on the same key,
                // including the first insert.
                await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(
            hashtextextended(${key}, 0)
          )
        `;

                const now = new Date();

                const current = await tx.authRateLimit.findUnique({
                    where: { key },
                });

                // Return a result instead of throwing inside
                // the transaction, so updates can commit.
                if (
                    current?.lockedUntil &&
                    current.lockedUntil > now
                ) {
                    return {
                        lockedUntil: current.lockedUntil,
                    };
                }

                const expired =
                    current !== null &&
                    this.isExpired(current, now);

                const attempts = expired
                    ? 1
                    : (current?.attempts ?? 0) + 1;

                const previousLevel = expired
                    ? 0
                    : (current?.lockLevel ?? 0);

                const shouldLock =
                    attempts >= this.maxAttempts;

                const lockLevel = shouldLock
                    ? previousLevel + 1
                    : previousLevel;

                const lockedUntil = shouldLock
                    ? new Date(
                        now.getTime() +
                        this.getLockDuration(lockLevel),
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

                return { lockedUntil };
            },
            {
                maxWait: 5000,
                timeout: 10000,
            },
        );

        if (outcome.lockedUntil) {
            this.throwIfLocked(
                {
                    attempts: 0,
                    lockLevel: 0,
                    lockedUntil: outcome.lockedUntil,
                    lastAttempt: new Date(),
                },
                new Date(),
            );
        }
    }

    async reset(input: RateLimitKey): Promise<void> {
        const key = this.makeKey(input);

        await this.prisma.$transaction(async (tx) => {
            await tx.$queryRaw`
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
