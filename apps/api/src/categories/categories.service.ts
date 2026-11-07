import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    findAll() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findBySlug(slug: string) {
        const category = await this.prisma.category.findUnique({
            where: { slug },
        });

        if (!category) {
            throw new NotFoundException('Không tìm thấy danh mục');
        }

        return category;
    }

    async create(dto: CreateCategoryDto) {
        try {
            return await this.prisma.category.create({
                data: dto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async update(id: string, dto: UpdateCategoryDto) {
        await this.ensureExists(id);

        try {
            return await this.prisma.category.update({
                where: { id },
                data: dto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: string) {
        await this.ensureExists(id);

        const productCount = await this.prisma.product.count({
            where: { categoryId: id },
        });

        if (productCount > 0) {
            throw new ConflictException('Không thể xóa danh mục đang có sản phẩm');
        }

        try {
            await this.prisma.category.delete({
                where: { id }
            });

            return { message: 'Đã xóa danh mục thành công' }
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private async ensureExists(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id }
        });

        if (!category) {
            throw new NotFoundException('Không tìm thấy danh mục');
        }

        return category;
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new ConflictException(
                    'Slug danh mục đã tồn tại',
                );
            }

            if (error.code === 'P2003') {
                throw new ConflictException(
                    'Danh mục đang được sử dụng',
                );
            }

            if (error.code === 'P2025') {
                throw new NotFoundException(
                    'Không tìm thấy danh mục',
                );
            }
        }

        throw error;
    }
}
