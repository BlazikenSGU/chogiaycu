import { Injectable, BadRequestException, ConflictException, NotFoundException, BadGatewayException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { ProductStatus } from '../generated/prisma/enums.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import {
    ProductSort,
    QueryProductDto,
} from './dto/query-product.dto.js';
import { SortOrder } from '../generated/prisma/internal/prismaNamespace.js';
import { randomUUID } from 'node:crypto';
import { ImageKitStorageService } from '../uploads/imagekit-storage.service.js';
import { ImageKitCleanupService } from '../uploads/imagekit-cleanup.service.js';

@Injectable()
export class ProductsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly imageKitStorage: ImageKitStorageService,
        private readonly imageKitCleanup: ImageKitCleanupService
    ) { }

    private readonly logger = new Logger(ProductsService.name);

    private readonly includeRelations = {
        brand: true,
        category: true,
        images: {
            orderBy: { sortOrder: 'asc' as const }
        },
    };

    private async validateRelations(
        brandId?: string,
        categoryId?: string
    ) {
        if (brandId) {
            const brand = await this.prisma.brand.findUnique({
                where: { id: brandId },
                select: { id: true },
            });

            if (!brand) {
                throw new BadRequestException('Thương hiệu không tồn tại');
            }
        }

        if (categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: categoryId },
                select: { id: true },
            });

            if (!category) {
                throw new BadRequestException('Danh mục không tồn tại');
            }
        }
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new ConflictException('Slug sản phẩm đã tồn tại');
            }

            if (error.code === 'P2003') {
                throw new BadRequestException(
                    'Thương hiệu hoặc danh mục không hợp lệ',
                );
            }

            if (error.code === 'P2025') {
                throw new NotFoundException(
                    'Không tìm thấy sản phẩm',
                );
            }
        }

        throw error;
    }

    async create(dto: CreateProductDto) {
        await this.validateRelations(dto.brandId, dto.categoryId);

        try {
            return await this.prisma.product.create({
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    price: dto.price,
                    size: dto.size,
                    stock: dto.stock ?? 1,
                    status: dto.status ?? ProductStatus.DRAFT,
                    brand: {
                        connect: { id: dto.brandId }
                    },
                    category: {
                        connect: { id: dto.categoryId }
                    },
                    ...(dto.description !== undefined && {
                        description: dto.description,
                    }),
                    ...(dto.originalPrice !== undefined && {
                        originalPrice: dto.originalPrice,
                    }),
                    ...(dto.conditionPercent !== undefined && {
                        conditionPercent: dto.conditionPercent,
                    }),
                    ...(dto.conditionNote !== undefined && {
                        conditionNote: dto.conditionNote,
                    }),
                },
                include: this.includeRelations,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }


    async createWithImages(
        dto: CreateProductDto,
        files: Express.Multer.File[],
    ) {
        // 1. Validate trước khi upload.
        await this.validateRelations(dto.brandId, dto.categoryId);

        if (files.length > 6) {
            throw new BadRequestException(
                'Mỗi sản phẩm chỉ được tối đa 6 ảnh',
            );
        }

        for (const file of files) {
            this.imageKitStorage.validateImage(file);
        }

        // 2. Kiểm tra slug trước để tránh upload không cần thiết.
        const existing = await this.prisma.product.findUnique({
            where: { slug: dto.slug },
            select: { id: true },
        });

        if (existing) {
            throw new ConflictException(
                'Slug sản phẩm đã tồn tại',
            );
        }

        // 3. Sinh ID trước khi upload.
        // Chưa tạo bất kỳ bản ghi Product nào.
        const productId = randomUUID();

        // 4. Upload song song.
        // Nếu có ảnh lỗi, uploadManyOrRollback tự dọn ảnh
        // đã upload thành công rồi throw.
        const uploadedFiles =
            await this.imageKitStorage.uploadManyOrRollback(
                files,
                productId,
            );

        // 5. Chỉ ghi DB sau khi toàn bộ ảnh thành công.
        try {
            return await this.prisma.$transaction(async (tx) => {

                return tx.product.create({
                    data: {
                        id: productId,
                        name: dto.name,
                        slug: dto.slug,
                        price: dto.price,
                        size: dto.size,
                        stock: dto.stock ?? 1,
                        status: dto.status ?? ProductStatus.DRAFT,

                        brand: {
                            connect: { id: dto.brandId },
                        },
                        category: {
                            connect: { id: dto.categoryId },
                        },

                        ...(dto.description !== undefined && {
                            description: dto.description,
                        }),
                        ...(dto.originalPrice !== undefined && {
                            originalPrice: dto.originalPrice,
                        }),
                        ...(dto.conditionPercent !== undefined && {
                            conditionPercent: dto.conditionPercent,
                        }),
                        ...(dto.conditionNote !== undefined && {
                            conditionNote: dto.conditionNote,
                        }),

                        images: {
                            create: uploadedFiles.map((image, index) => ({
                                fileId: image.fileId,
                                url: image.url,
                                alt: image.originalName,
                                sortOrder: index,
                                isPrimary: index === 0,
                            })),
                        },
                    },
                    include: this.includeRelations,
                });
            });

        } catch (error) {
            // 1. Xóa toàn bộ ảnh đã upload thành công.
            const cleanupResults = await Promise.allSettled(
                uploadedFiles.map((image) =>
                    this.imageKitStorage.delete(image.fileId),
                ),
            );

            const cleanupFailed = cleanupResults.some(
                (result) => result.status === 'rejected',
            );

            if (cleanupFailed) {
                this.logger.error(
                    `Rollback ảnh ImageKit thất bại: productId=${productId}`,
                );

                throw new BadGatewayException(
                    'Tạo sản phẩm thất bại và chưa thể dọn sạch ảnh trên ImageKit',
                );
            }

            // 2. Xóa thư mục UUID sau khi rollback ảnh.
            try {
                await this.imageKitStorage.deleteProductFolder(
                    productId,
                );
            } catch (folderError) {
                this.logger.error(
                    `Không thể xóa thư mục ImageKit: productId=${productId}`,
                    folderError instanceof Error
                        ? folderError.stack
                        : String(folderError),
                );

                throw new BadGatewayException(
                    'Tạo sản phẩm thất bại, ảnh đã được xóa nhưng thư mục ImageKit chưa được dọn sạch',
                );
            }

            // 3. Giữ nguyên lỗi Prisma gốc nếu cleanup thành công.
            this.handlePrismaError(error);
        }
    }


    async findAll(query: QueryProductDto, admin = false) {
        const {
            page,
            limit,
            search,
            brandId,
            categoryId,
            minPrice,
            maxPrice,
            size,
            minCondition,
            status,
            sort,
        } = query;

        if (
            minPrice !== undefined &&
            maxPrice !== undefined &&
            minPrice > maxPrice
        ) {
            throw new BadRequestException('minPrice không được lớn hơn maxPrice');
        }

        const where: Prisma.ProductWhereInput = {
            ...(!admin && {
                status: ProductStatus.ACTIVE,
                stock: { gt: 0 },
            }),
            ...(admin && status && { status }),
            ...(search && {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        slug: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
            ...(brandId && { brandId }),
            ...(categoryId && { categoryId }),
            ...(size && { size }),
            ...(minCondition !== undefined && {
                conditionPercent: { gte: minCondition },
            }),
            ...((minPrice !== undefined || maxPrice !== undefined) && {
                price: {
                    ...(minPrice !== undefined && {
                        gte: minPrice,
                    }),
                    ...(maxPrice !== undefined && {
                        lte: maxPrice,
                    }),
                },
            }),
        };

        const orderBy: Prisma.ProductOrderByWithRelationInput =
            sort === ProductSort.OLDEST
                ? { createdAt: 'asc' }
                : sort === ProductSort.PRICE_ASC
                    ? { price: 'asc' }
                    : sort === ProductSort.PRICE_DESC
                        ? { price: 'desc' }
                        : { createdAt: 'desc' };

        const skip = (page - 1) * limit;
        const [data, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: [orderBy, { id: 'asc' }],
                include: this.includeRelations,
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findBySlug(slug: string) {
        const product = await this.prisma.product.findFirst({
            where: {
                slug,
                status: ProductStatus.ACTIVE,
                stock: { gt: 0 },
            },
            include: this.includeRelations,
        });

        if (!product) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }

        return product;
    }

    async findById(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: this.includeRelations,
        });

        if (!product) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }

        return product;
    }

    async update(id: string, dto: UpdateProductDto) {
        await this.findById(id);
        await this.validateRelations(dto.brandId, dto.categoryId);

        try {
            return await this.prisma.product.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && {
                        name: dto.name,
                    }),
                    ...(dto.slug !== undefined && {
                        slug: dto.slug,
                    }),
                    ...(dto.description !== undefined && {
                        description: dto.description,
                    }),
                    ...(dto.price !== undefined && {
                        price: dto.price,
                    }),
                    ...(dto.originalPrice !== undefined && {
                        originalPrice: dto.originalPrice,
                    }),
                    ...(dto.size !== undefined && {
                        size: dto.size,
                    }),
                    ...(dto.conditionPercent !== undefined && {
                        conditionPercent: dto.conditionPercent,
                    }),
                    ...(dto.conditionNote !== undefined && {
                        conditionNote: dto.conditionNote,
                    }),
                    ...(dto.stock !== undefined && {
                        stock: dto.stock,
                    }),
                    ...(dto.status !== undefined && {
                        status: dto.status,
                    }),
                    ...(dto.brandId !== undefined && {
                        brand: {
                            connect: { id: dto.brandId },
                        },
                    }),
                    ...(dto.categoryId !== undefined && {
                        category: {
                            connect: { id: dto.categoryId },
                        },
                    }),
                },
                include: this.includeRelations,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: string) {
        try {
            await this.prisma.$transaction(async (tx) => {
                const locked = await tx.$queryRaw<
                    Array<{ id: string }>
                >`
                    SELECT id
                    FROM products
                    WHERE id = ${id}
                    FOR UPDATE
                `;

                if (locked.length === 0) {
                    throw new NotFoundException(
                        'Không tìm thấy sản phẩm',
                    );
                }

                await this.imageKitCleanup.enqueueDeleteFolder(id, tx);

                await tx.product.delete({
                    where: { id },
                });
            });


            return {
                message: 'Đã xóa ảnh thành công',
            };
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

}
