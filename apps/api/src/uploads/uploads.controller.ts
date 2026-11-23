import {
    BadRequestException,
    Controller,
    Delete,
    Param,
    ParseFilePipeBuilder,
    Patch,
    Post,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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

    //upload 1 lúc nhiều ảnh
    @Post('batch')
    @UseInterceptors(
        FilesInterceptor('images', 6, {
            storage: memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024,
                files: 6,
            },
        }),
    )
    uploadBatch(
        @Param('id') productId: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException(
                'Vui lòng chọn ít nhất một ảnh',
            );
        }

        return this.uploadsService.uploadBatch(
            productId,
            files,
        );
    }

    // upload 1 lúc 1 ảnh
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

    //set ảnh đại diện
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

    //xóa ảnh
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
