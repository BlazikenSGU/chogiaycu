import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';

@Injectable()
export class BrandsService {
    constructor(private readonly prisma: PrismaService) { }

    findAll() {
        return this.prisma.brand.findMany({
            orderBy: {
                name: 'asc',
            }
        });
    }

    async findBySlug(slug: string) {
        const brand = await this.prisma.brand.findUnique({
            where: { slug }
        });

        if (!brand) {
            throw new NotFoundException('Không tìm thấy thương hiệu');
        }

        return brand;
    }

    async create(dto: CreateBrandDto) {
        try {
            return await this.prisma.brand.create({
                data: dto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async update(id: string, dto: UpdateBrandDto) {
        await this.ensureExists(id);

        try {
            return await this.prisma.brand.update({
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
            where: { brandId: id },
        });

        if (productCount > 0) {
            throw new ConflictException('Không thể xóa thương hiệu đang có sản phẩm');
        }

        try {
            await this.prisma.brand.delete({
                where: { id },
            });

            return { message: 'Xóa thương hiệu thành công' };
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private async ensureExists(id: string) {
        const brand = await this.prisma.brand.findUnique({
            where: { id },
        });

        if (!brand) {
            throw new NotFoundException('Không tìm thấy thương hiệu');
        }

        return brand;
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new ConflictException(
                    'Slug thương hiệu đã tồn tại',
                );
            }


            if (error.code === 'P2003') {
                throw new ConflictException(
                    'Thương hiệu đang được sử dụng',
                );
            }

            if (error.code === 'P2025') {
                throw new ConflictException(
                    'Không tìm thấy thương hiệu'
                );
            }
        }

        throw error;
    }
}
