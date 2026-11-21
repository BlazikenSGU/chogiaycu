import {
    Controller,
    Body,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    ParseFilePipeBuilder,
} from '@nestjs/common';
import { BrandsService } from './brands.service.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../generated/prisma/enums.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BrandLogoService } from './brand-logo.service.js';

@Controller('brands')
export class BrandsController {
    constructor(
        private readonly brandsService: BrandsService,
        private readonly brandsLogoService: BrandLogoService
    ) { }

    @Post('logo/upload')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: {
                fileSize: 2 * 1024 * 1024,
                files: 1,
            },
        }),
    )
    uploadLogo(
        @UploadedFile(
            new ParseFilePipeBuilder().addMaxSizeValidator({
                maxSize: 2 * 1024 * 1024,
            }).build({
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.brandsLogoService.upload(file);
    }

    @Get()
    findAll() {
        return this.brandsService.findAll();
    }

    @Get(':slug')
    findBySlug(@Param('slug') slug: string) {
        return this.brandsService.findBySlug(slug);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(
        @Body() dto: CreateBrandDto
    ) {
        return this.brandsService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    update(
        @Param('id') id: string,
        @Body() dto: UpdateBrandDto,
    ) {
        return this.brandsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
        @Param('id') id: string,
    ) {
        return this.brandsService.remove(id);
    }

}
