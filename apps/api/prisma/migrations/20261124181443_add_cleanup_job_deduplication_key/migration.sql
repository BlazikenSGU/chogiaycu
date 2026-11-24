/*
  Warnings:

  - A unique constraint covering the columns `[deduplicationKey]` on the table `imagekit_cleanup_jobs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deduplicationKey` to the `imagekit_cleanup_jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "imagekit_cleanup_jobs" ADD COLUMN     "deduplicationKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "imagekit_cleanup_jobs_deduplicationKey_key" ON "imagekit_cleanup_jobs"("deduplicationKey");
