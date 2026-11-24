
import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import {
    Prisma,
    ImageKitCleanupType,
    ImageKitCleanupStatus,
} from '../generated/prisma/client.js';

type CleanupDbClient =
    | PrismaService
    | Prisma.TransactionClient;

@Injectable()
export class ImageKitCleanupService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    private getDb(
        tx?: Prisma.TransactionClient,
    ): CleanupDbClient {
        return tx ?? this.prisma;
    }


    async enqueueDeleteFile(
        productId: string,
        fileId: string,
        tx?: Prisma.TransactionClient,
    ) {
        const normalizedProductId = productId.trim();
        const normalizedFileId = fileId.trim();

        if (!normalizedProductId) {
            throw new BadRequestException(
                'Product ID không hợp lệ',
            );
        }

        if (!normalizedFileId) {
            throw new BadRequestException(
                'ImageKit File ID không hợp lệ',
            );
        }

        const db = this.getDb(tx);
        const deduplicationKey = `file:${normalizedFileId}`;
        const now = new Date();

        await db.imageKitCleanupJob.createMany({
            data: [
                {
                    deduplicationKey,
                    type: ImageKitCleanupType.DELETE_FILE,
                    status: ImageKitCleanupStatus.PENDING,
                    productId: normalizedProductId,
                    fileId: normalizedFileId,
                    nextAttemptAt: now,
                    createdAt: now,
                },
            ],
            skipDuplicates: true,
        });

        return db.imageKitCleanupJob.findUniqueOrThrow({
            where: {
                deduplicationKey,
            },
        });
    }

    async enqueueDeleteFolder(
        productId: string,
        tx?: Prisma.TransactionClient,
    ) {
        const normalizedProductId = productId.trim();

        if (!normalizedProductId) {
            throw new BadRequestException(
                'Product ID không hợp lệ',
            );
        }

        const db = this.getDb(tx);
        const deduplicationKey = `folder:${normalizedProductId}`;
        const now = new Date();

        await db.imageKitCleanupJob.createMany({
            data: [
                {
                    deduplicationKey,
                    type: ImageKitCleanupType.DELETE_FOLDER,
                    status: ImageKitCleanupStatus.PENDING,
                    productId: normalizedProductId,
                    fileId: null,
                    nextAttemptAt: now,
                    createdAt: now,
                },
            ],
            skipDuplicates: true,
        });

        return db.imageKitCleanupJob.findUniqueOrThrow({
            where: {
                deduplicationKey,
            },
        });
    }

}
