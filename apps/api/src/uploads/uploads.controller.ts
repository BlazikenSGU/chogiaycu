import {
    Controller,
    Delete,
    Param,
    ParseFilePipeBuilder,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../generated/prisma/enums.js';

@Controller('products/:id/images')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UploadsController {
    constructor(
        private readonly uploadsService: UploadsService,
    ) { }

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024,
                files: 1,
            },
        }),
    )
    upload(
        @Param('id') productId: string,
        @UploadedFile(
            new ParseFilePipeBuilder().addMaxSizeValidator({
                maxSize: 5 * 1024 * 1024
            }).build({
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File
    ) {
        return this.uploadsService.upload(
            productId,
            file,
        );
    }

    @Patch(':imageId/primary')
    setPrimary(
        @Param('id') productId: string,
        @Param('imageId') imageId: string,
    ) {
        return this.uploadsService.setPrimary(
            productId,
            imageId
        );
    }

    @Delete(':imageId') 
    remove(
        @Param('id') productId: string,
        @Param('imageId') imageId: string,
    ) {
        return this.uploadsService.remove(
            productId,
            imageId
        );
    }
}
