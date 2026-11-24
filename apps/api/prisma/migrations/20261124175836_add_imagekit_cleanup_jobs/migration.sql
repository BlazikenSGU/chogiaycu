-- CreateEnum
CREATE TYPE "ImageKitCleanupStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImageKitCleanupType" AS ENUM ('DELETE_FILE', 'DELETE_FOLDER');

-- CreateTable
CREATE TABLE "imagekit_cleanup_jobs" (
    "id" TEXT NOT NULL,
    "type" "ImageKitCleanupType" NOT NULL,
    "status" "ImageKitCleanupStatus" NOT NULL DEFAULT 'PENDING',
    "productId" TEXT NOT NULL,
    "fileId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttemptAt" TIMESTAMP(3),
    "lastError" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockToken" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imagekit_cleanup_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "imagekit_cleanup_jobs_status_nextAttemptAt_idx" ON "imagekit_cleanup_jobs"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "imagekit_cleanup_jobs_status_lockedAt_idx" ON "imagekit_cleanup_jobs"("status", "lockedAt");

-- CreateIndex
CREATE INDEX "imagekit_cleanup_jobs_productId_idx" ON "imagekit_cleanup_jobs"("productId");

-- CreateIndex
CREATE INDEX "imagekit_cleanup_jobs_fileId_idx" ON "imagekit_cleanup_jobs"("fileId");
