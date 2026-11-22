
import {
    Injectable,
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { ImageKitStorageService } from './imagekit-storage.service.js';

@Injectable()
export class UploadsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly imageKitStorage: ImageKitStorageService,
    ) { }

    private async getProduct(productId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }

        return product;
    }

    private async getImage(
        productId: string,
        imageId: string,
    ) {
        const image = await this.prisma.productImage.findFirst({
            where: {
                id: imageId,
                productId,
            },
        });

        if (!image) {
            throw new NotFoundException(
                'Không tìm thấy ảnh sản phẩm',
            );
        }

        return image;
    }

    async upload(
        productId: string,
        file: Express.Multer.File | undefined,
    ) {
        await this.getProduct(productId);

        if (!file) {
            throw new BadRequestException('Vui lòng chọn ảnh');
        }

        // Validate trước khi gọi ImageKit.
        this.imageKitStorage.validateImage(file);

        // Kiểm tra giới hạn 6 ảnh.
        const count = await this.prisma.productImage.count({
            where: { productId },
        });

        if (count >= 6) {
            throw new ConflictException(
                'Mỗi sản phẩm chỉ được tối đa 6 ảnh',
            );
        }

        // Upload file lên ImageKit.
        const uploaded = await this.imageKitStorage.upload(
            file,
            productId,
        );

        try {
            // Ghi thông tin ảnh vào PostgreSQL.
            return await this.prisma.productImage.create({
                data: {
                    productId,
                    fileId: uploaded.fileId,
                    url: uploaded.url,
                    alt: uploaded.originalName,
                    sortOrder: count,
                    isPrimary: count === 0,
                },
            });
        } catch (error) {
            // Nếu DB thất bại, xóa file vừa upload.
            try {
                await this.imageKitStorage.delete(uploaded.fileId);
            } catch (cleanupError) {
                console.error(
                    'Không thể rollback ảnh ImageKit:',
                    uploaded.fileId,
                    cleanupError,
                );
            }

            throw error;
        }
    }

    async setPrimary(
        productId: string,
        imageId: string,
    ) {
        await this.getImage(productId, imageId);

        return this.prisma.$transaction(async (tx) => {
            await tx.productImage.updateMany({
                where: { productId },
                data: { isPrimary: false },
            });

            return tx.productImage.update({
                where: { id: imageId },
                data: { isPrimary: true },
            });
        });
    }

    async remove(
        productId: string,
        imageId: string,
    ) {
        const image = await this.getImage(
            productId,
            imageId,
        );

        // Xóa ảnh trên ImageKit trước.
        await this.imageKitStorage.delete(image.fileId);

        // Sau đó cập nhật database.
        await this.prisma.$transaction(async (tx) => {
            await tx.productImage.delete({
                where: { id: imageId },
            });

            if (image.isPrimary) {
                const nextImage =
                    await tx.productImage.findFirst({
                        where: { productId },
                        orderBy: [
                            { sortOrder: 'asc' },
                            { id: 'asc' },
                        ],
                    });

                if (nextImage) {
                    await tx.productImage.update({
                        where: { id: nextImage.id },
                        data: { isPrimary: true },
                    });
                }
            }
        });

        return {
            message: 'Đã xóa ảnh thành công',
        };
    }
}
