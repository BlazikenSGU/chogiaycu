import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnApplicationBootstrap
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service.js';
import { ImageKitStorageService } from './imagekit-storage.service.js';

import { randomUUID } from 'node:crypto';

import {
    ImageKitCleanupStatus,
    ImageKitCleanupType,
    type ImageKitCleanupJob,
} from '../generated/prisma/client.js';

interface CleanupWorkerConfig {
    enabled: boolean;
    pollIntervalMs: number;
    batchSize: number;
    lockTimeoutMs: number;
}

@Injectable()
export class ImageKitCleanupWorker
    implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly logger = new Logger(
        ImageKitCleanupWorker.name,
    );

    private readonly config: CleanupWorkerConfig;

    private pollingTimer:
        ReturnType<typeof setTimeout> | null = null;

    private activePoll: Promise<void> | null = null;

    private isStopping = false;

    constructor(
        private readonly prisma: PrismaService,
        private readonly imageKitStorage: ImageKitStorageService,
        private readonly configService: ConfigService,
    ) {
        this.config = this.loadConfig();
    }

    private readBoolean(
        key: string,
        defaultValue: boolean,
    ): boolean {
        const raw = this.configService.get<string>(key);

        if (raw === undefined) {
            return defaultValue;
        }

        const value = raw.trim().toLowerCase();

        if (value === 'true') {
            return true;
        }

        if (value === 'false') {
            return false;
        }

        throw new Error(
            `${key} must be either true or false`,
        );
    }

    private readInteger(
        key: string,
        defaultValue: number,
        min: number,
        max: number,
    ): number {
        const raw = this.configService.get<string>(key);

        if (raw === undefined) {
            return defaultValue;
        }

        const normalized = raw.trim();

        if (!/^\d+$/.test(normalized)) {
            throw new Error(
                `${key} must be a valid integer`,
            );
        }

        const value = Number(normalized);

        if (
            !Number.isSafeInteger(value) ||
            value < min ||
            value > max
        ) {
            throw new Error(
                `${key} must be between ${min} and ${max}`,
            );
        }

        return value;
    }

    private loadConfig(): CleanupWorkerConfig {
        return {
            enabled: this.readBoolean(
                'IMAGEKIT_CLEANUP_ENABLED',
                false,
            ),

            pollIntervalMs: this.readInteger(
                'IMAGEKIT_CLEANUP_POLL_INTERVAL_MS',
                10000,
                1000,
                300000,
            ),

            batchSize: this.readInteger(
                'IMAGEKIT_CLEANUP_BATCH_SIZE',
                5,
                1,
                50,
            ),

            lockTimeoutMs: this.readInteger(
                'IMAGEKIT_CLEANUP_LOCK_TIMEOUT_MS',
                120000,
                60000,
                900000,
            ),
        };
    }

    private async claimNextJob(): Promise<ImageKitCleanupJob | null> {
        const lockToken = randomUUID();

        return this.prisma.$transaction(async (tx) => {
            const jobs = await tx.$queryRaw<
                Array<{ id: string }>
            >`
            SELECT id
            FROM imagekit_cleanup_jobs
            WHERE status = 'PENDING'
                AND "nextAttemptAt" <= (NOW() AT TIME ZONE 'UTC')
                AND attempts < "maxAttempts"
            ORDER BY
                "nextAttemptAt" ASC,
                "createdAt" ASC,
                id ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
        `;

            if (jobs.length === 0) {
                return null;
            }

            const job = jobs[0];
            const now = new Date();

            return tx.imageKitCleanupJob.update({
                where: {
                    id: job.id,
                },
                data: {
                    status: ImageKitCleanupStatus.PROCESSING,

                    attempts: {
                        increment: 1,
                    },

                    lockedAt: now,
                    lockToken,
                    lastAttemptAt: now,
                },
            });
        });
    }

    private async executeDeleteFile(
        job: ImageKitCleanupJob,
    ): Promise<void> {
        // Ensure the job has the correct type.
        if (job.type !== ImageKitCleanupType.DELETE_FILE) {
            throw new Error(
                `Invalid cleanup job type: ${job.type}`,
            );
        }

        // Only claimed jobs may be executed.
        if (
            job.status !==
            ImageKitCleanupStatus.PROCESSING
        ) {
            throw new Error(
                `Cleanup job ${job.id} is not PROCESSING`,
            );
        }

        // Validate the claim metadata.
        if (!job.lockToken || !job.lockedAt) {
            throw new Error(
                `Cleanup job ${job.id} has invalid lock metadata`,
            );
        }

        // Validate the ImageKit file ID.
        const fileId = job.fileId?.trim();

        if (!fileId) {
            throw new Error(
                `Cleanup job ${job.id} is missing fileId`,
            );
        }

        // Execute the external operation.
        await this.imageKitStorage.delete(fileId);
    }

    private async executeDeleteFolder(
        job: ImageKitCleanupJob,
    ): Promise<void> {
        // Ensure the job has the correct type.
        if (
            job.type !==
            ImageKitCleanupType.DELETE_FOLDER
        ) {
            throw new Error(
                `Invalid cleanup job type: ${job.type}`,
            );
        }

        // Only claimed jobs may be executed.
        if (
            job.status !==
            ImageKitCleanupStatus.PROCESSING
        ) {
            throw new Error(
                `Cleanup job ${job.id} is not PROCESSING`,
            );
        }

        // Validate the claim metadata.
        if (!job.lockToken || !job.lockedAt) {
            throw new Error(
                `Cleanup job ${job.id} has invalid lock metadata`,
            );
        }

        // Validate the product ID.
        const productId = job.productId?.trim();

        if (!productId) {
            throw new Error(
                `Cleanup job ${job.id} is missing productId`,
            );
        }

        // DELETE_FOLDER must not contain a fileId.
        if (job.fileId !== null) {
            throw new Error(
                `Cleanup job ${job.id} has unexpected fileId`,
            );
        }

        // Prevent deletion of an active product folder.
        const existingProduct =
            await this.prisma.product.findUnique({
                where: {
                    id: productId,
                },
                select: {
                    id: true,
                },
            });

        if (existingProduct) {
            throw new Error(
                `Cannot delete folder of existing product ${productId}`,
            );
        }

        // Execute the external operation.
        await this.imageKitStorage.deleteProductFolder(
            productId,
        );
    }

    private async executeJob(
        job: ImageKitCleanupJob,
    ): Promise<void> {
        switch (job.type) {
            case ImageKitCleanupType.DELETE_FILE:
                await this.executeDeleteFile(job);
                return;

            case ImageKitCleanupType.DELETE_FOLDER:
                await this.executeDeleteFolder(job);
                return;

            default:
                throw new Error(
                    `Unsupported cleanup job type: ${job.type}`,
                );
        }
    }

    private async markJobCompleted(
        job: ImageKitCleanupJob,
    ): Promise<boolean> {
        // Validate the claim token.
        if (!job.lockToken) {
            throw new Error(
                `Cleanup job ${job.id} is missing lockToken`,
            );
        }

        const result =
            await this.prisma.imageKitCleanupJob.updateMany({
                where: {
                    id: job.id,

                    status:
                        ImageKitCleanupStatus.PROCESSING,

                    lockToken: job.lockToken,
                },

                data: {
                    status:
                        ImageKitCleanupStatus.COMPLETED,

                    completedAt: new Date(),

                    lastError: null,

                    lockedAt: null,

                    lockToken: null,
                },
            });

        // The worker no longer owns the job,
        // or the job is no longer PROCESSING.
        if (result.count === 0) {
            this.logger.warn(
                `Cannot complete cleanup job ${job.id}: claim ownership lost or job state changed`,
            );

            return false;
        }

        this.logger.log(
            `Cleanup job ${job.id} completed successfully (${job.type})`,
        );

        return true;
    }

    private calculateRetryDelay(attempts: number): number {
        const baseDelayMs = 60_000;
        const maxDelayMs = 60 * 60_000;

        return Math.min(
            baseDelayMs * Math.pow(
                2,
                Math.max(0, attempts - 1),
            ),
            maxDelayMs,
        );
    }

    private getErrorMessage(error: unknown): string {
        let message: string;

        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        } else {
            message = 'Unknown cleanup error';
        }

        return message.slice(0, 2000);
    }

    private async markJobFailed(
        job: ImageKitCleanupJob,
        error: unknown,
    ): Promise<boolean> {
        if (!job.lockToken) {
            throw new Error(
                `Cleanup job ${job.id} is missing lockToken`,
            );
        }

        const errorMessage = this.getErrorMessage(error);

        const exhausted =
            job.attempts >= job.maxAttempts;

        const nextAttemptAt = exhausted
            ? job.nextAttemptAt
            : new Date(
                Date.now() +
                this.calculateRetryDelay(job.attempts),
            );

        const result =
            await this.prisma.imageKitCleanupJob.updateMany({
                where: {
                    id: job.id,

                    status:
                        ImageKitCleanupStatus.PROCESSING,

                    lockToken: job.lockToken,
                },

                data: {
                    status: exhausted
                        ? ImageKitCleanupStatus.FAILED
                        : ImageKitCleanupStatus.PENDING,

                    lastError: errorMessage,

                    nextAttemptAt,

                    lockedAt: null,

                    lockToken: null,

                    completedAt: null,
                },
            });

        if (result.count === 0) {
            this.logger.warn(
                `Cannot update failed cleanup job ${job.id}: claim ownership lost or job state changed`,
            );

            return false;
        }

        if (exhausted) {
            this.logger.error(
                `Cleanup job ${job.id} permanently failed after ${job.attempts} attempts: ${errorMessage}`,
            );
        } else {
            this.logger.warn(
                `Cleanup job ${job.id} failed (${job.attempts}/${job.maxAttempts}). Next attempt: ${nextAttemptAt.toISOString()}. Error: ${errorMessage}`,
            );
        }

        return true;
    }

    private async processJob(
        job: ImageKitCleanupJob,
    ): Promise<void> {
        this.logger.log(
            `Processing cleanup job ${job.id} (${job.type}) - Attempt ${job.attempts}/${job.maxAttempts}`,
        );

        try {
            await this.executeJob(job);
        } catch (error) {
            await this.markJobFailed(job, error);

            return;
        }

        await this.markJobCompleted(job);
    }

    private async recoverExpiredJobs(): Promise<void> {
        const now = new Date();

        const expiredBefore = new Date(
            now.getTime() - this.config.lockTimeoutMs,
        );

        const expiredCondition = {
            status: ImageKitCleanupStatus.PROCESSING,

            OR: [
                {
                    lockedAt: {
                        lte: expiredBefore,
                    },
                },
                {
                    lockedAt: null,
                },
            ],
        };

        // Recover jobs that still have attempts left.
        const recovered =
            await this.prisma.imageKitCleanupJob.updateMany({
                where: {
                    ...expiredCondition,

                    attempts: {
                        lt: this.prisma
                            .imageKitCleanupJob.fields
                            .maxAttempts,
                    },
                },

                data: {
                    status:
                        ImageKitCleanupStatus.PENDING,

                    nextAttemptAt: now,

                    lockedAt: null,

                    lockToken: null,

                    lastError:
                        'Previous cleanup worker lock expired',
                },
            });

        // Permanently fail jobs that exhausted attempts.
        const failed =
            await this.prisma.imageKitCleanupJob.updateMany({
                where: {
                    ...expiredCondition,

                    attempts: {
                        gte: this.prisma
                            .imageKitCleanupJob.fields
                            .maxAttempts,
                    },
                },

                data: {
                    status:
                        ImageKitCleanupStatus.FAILED,

                    lockedAt: null,

                    lockToken: null,

                    lastError:
                        'Cleanup worker lock expired and maximum attempts reached',
                },
            });

        if (recovered.count > 0) {
            this.logger.warn(
                `Recovered ${recovered.count} expired cleanup jobs`,
            );
        }

        if (failed.count > 0) {
            this.logger.error(
                `Marked ${failed.count} expired cleanup jobs as FAILED`,
            );
        }
    }

    private async poll(): Promise<void> {
        if (this.isStopping) {
            return;
        }

        // Recover jobs abandoned by previous workers.
        await this.recoverExpiredJobs();

        for (
            let index = 0;
            index < this.config.batchSize;
            index++
        ) {
            if (this.isStopping) {
                break;
            }

            const job = await this.claimNextJob();

            if (!job) {
                break;
            }

            await this.processJob(job);
        }
    }

    private scheduleNextPoll(
        delayMs = this.config.pollIntervalMs,
    ): void {
        if (
            !this.config.enabled ||
            this.isStopping ||
            this.pollingTimer !== null ||
            this.activePoll !== null
        ) {
            return;
        }

        this.pollingTimer = setTimeout(() => {
            this.pollingTimer = null;

            this.startPollingCycle();
        }, delayMs);
    }

    private startPollingCycle(): void {
        if (
            !this.config.enabled ||
            this.isStopping ||
            this.activePoll !== null
        ) {
            return;
        }

        this.activePoll = this.poll()
            .catch((error: unknown) => {
                this.logger.error(
                    `Cleanup polling failed: ${this.getErrorMessage(error)}`,
                );
            })
            .finally(() => {
                this.activePoll = null;

                if (!this.isStopping) {
                    this.scheduleNextPoll();
                }
            });
    }

    onApplicationBootstrap(): void {
        if (!this.config.enabled) {
            this.logger.log(
                'ImageKit cleanup worker is disabled',
            );

            return;
        }

        this.isStopping = false;

        this.logger.log(
            `ImageKit cleanup worker started. Poll interval: ${this.config.pollIntervalMs}ms, batch size: ${this.config.batchSize}, lock timeout: ${this.config.lockTimeoutMs}ms`,
        );

        // Start the first polling cycle immediately.
        this.scheduleNextPoll(0);
    }

    async onModuleDestroy(): Promise<void> {
        this.isStopping = true;

        if (this.pollingTimer !== null) {
            clearTimeout(this.pollingTimer);

            this.pollingTimer = null;
        }

        if (this.activePoll !== null) {
            this.logger.log(
                'Waiting for active cleanup polling cycle to finish',
            );

            await this.activePoll;
        }

        this.logger.log(
            'ImageKit cleanup worker stopped',
        );
    }
}
