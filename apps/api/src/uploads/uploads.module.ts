import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UploadsController } from './uploads.controller.js';
import { UploadsService } from './uploads.service.js';
import { ImageKitStorageService } from './imagekit-storage.service.js';
import { ImageKitCleanupService } from './imagekit-cleanup.service.js';
import { ImageKitCleanupWorker } from './imagekit-cleanup.worker.js';

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    ImageKitStorageService,
    ImageKitCleanupService,
    ImageKitCleanupWorker,
  ],
  exports: [
    ImageKitStorageService,
    ImageKitCleanupService
  ],
})
export class UploadsModule { }