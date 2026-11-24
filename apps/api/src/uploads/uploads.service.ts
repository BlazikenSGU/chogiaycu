
import {
    Injectable,
    BadRequestException,
    ConflictException,
    NotFoundException,
    BadGatewayException
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { ImageKitStorageService } from './imagekit-storage.service.js';
import { ImageKitCleanupService } from './imagekit-cleanup.service.js';

@Injectable()
export class UploadsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly imageKitStorage: ImageKitStorageService,
        private readonly imageKitCleanup: ImageKitCleanupService,
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
            return await this.prisma.$transaction(async (tx) => {
                const locked = await tx.$queryRaw<
                    Array<{ id: string }>
                >`
                     SELECT id
                    FROM products
                    WHERE id = ${productId}
                    FOR UPDATE
                `;

                if (locked.length === 0) {
                    throw new NotFoundException(
                        'Không tìm thấy sản phẩm',
                    );
                }

                const count = await tx.productImage.count({
                    where: { productId },
                });

                if (count >= 6) {
                    throw new ConflictException(
                        'Mỗi sản phẩm chỉ được tối đa 6 ảnh',
                    );
                }

                return tx.productImage.create({
                    data: {
                        productId,
                        fileId: uploaded.fileId,
                        url: uploaded.url,
                        alt: uploaded.originalName,
                        sortOrder: count,
                        isPrimary: count === 0,
                    },
                });
            });

        } catch (error) {
            try {
                await this.imageKitStorage.delete(uploaded.fileId);
            } catch (cleanupError) {
                console.error(
                    '[ImageKit rollback] Không thể xóa ảnh:',
                    uploaded.fileId,
                    cleanupError,
                );

                throw new BadGatewayException(
                    'Lưu ảnh thất bại và rollback ImageKit ' +
                    'chưa hoàn tất. Cần kiểm tra ảnh mới upload.',
                );
            }

            throw error;
        }
    }

    async uploadBatch(
        productId: string,
        files: Express.Multer.File[],
    ) {
        // 1. Kiểm tra sản phẩm tồn tại.
        await this.getProduct(productId);

        if (files.length === 0) {
            throw new BadRequestException(
                'Vui lòng chọn ít nhất một ảnh',
            );
        }

        if (files.length > 6) {
            throw new BadRequestException(
                'Mỗi lần chỉ được upload tối đa 6 ảnh',
            );
        }

        // 2. Validate tất cả ảnh trước khi upload.
        for (const file of files) {
            this.imageKitStorage.validateImage(file);
        }

        // 3. Kiểm tra sơ bộ giới hạn ảnh.
        const currentCount = await this.prisma.productImage.count({
            where: { productId },
        });

        if (currentCount + files.length > 6) {
            throw new ConflictException(
                `Sản phẩm đang có ${currentCount} ảnh. ` +
                `Không thể thêm ${files.length} ảnh.`,
            );
        }

        // 4. Upload song song lên ImageKit.
        // Không xóa thư mục vì sản phẩm đã tồn tại.
        const uploadedFiles =
            await this.imageKitStorage.uploadManyOrRollback(
                files,
                productId,
                { deleteFolderOnRollback: false },
            );

        try {
            // 5. Ghi toàn bộ ảnh trong một transaction.
            return await this.prisma.$transaction(async (tx) => {
                // Khóa dòng Product để tuần tự hóa
                // các batch upload cùng sản phẩm.
                const locked = await tx.$queryRaw<
                    Array<{ id: string }>
                >`
                SELECT id
                FROM products
                WHERE id = ${productId}
                FOR UPDATE
            `;

                if (locked.length === 0) {
                    throw new NotFoundException(
                        'Không tìm thấy sản phẩm',
                    );
                }

                // Đếm lại sau khi đã khóa.
                const count = await tx.productImage.count({
                    where: { productId },
                });

                if (count + uploadedFiles.length > 6) {
                    throw new ConflictException(
                        'Sản phẩm vượt giới hạn tối đa 6 ảnh',
                    );
                }

                // Ghi ảnh theo đúng thứ tự đã chọn.
                const images = [];

                for (let index = 0; index < uploadedFiles.length; index++) {
                    const image = uploadedFiles[index];

                    const created = await tx.productImage.create({
                        data: {
                            productId,
                            fileId: image.fileId,
                            url: image.url,
                            alt: image.originalName,
                            sortOrder: count + index,
                            isPrimary: count === 0 && index === 0,
                        },
                    });

                    images.push(created);
                }

                return images;
            });
        } catch (error) {
            // 6. Rollback chỉ các ảnh mới upload.
            const cleanupResults = await Promise.allSettled(
                uploadedFiles.map((image) =>
                    this.imageKitStorage.delete(image.fileId),
                ),
            );

            const cleanupFailed = cleanupResults.some(
                (result) => result.status === 'rejected',
            );

            if (cleanupFailed) {
                throw new BadGatewayException(
                    'Không thể lưu ảnh và rollback ImageKit chưa hoàn tất. ' +
                    'Cần kiểm tra các ảnh mới đã upload.',
                );
            }

            throw error;
        }
    }

    async setPrimary(
        productId: string,
        imageId: string,
    ) {
        return this.prisma.$transaction(async (tx) => {
            const locked = await tx.$queryRaw<
                Array<{ id: string }>
            >`
                SELECT id
                FROM products
                WHERE id = ${productId}
                FOR UPDATE
            `;

            if (locked.length === 0) {
                throw new NotFoundException(
                    'Không tìm thấy sản phẩm',
                );
            }

            const image = await tx.productImage.findFirst({
                where: {
                    id: imageId,
                    productId,
                },
            });

            if (!image) {
                throw new NotFoundException(
                    'Không tìm thấy ảnh sản phẩm'
                );
            }

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

    async remove(productId: string, imageId: string) {
        await this.prisma.$transaction(async (tx) => {
            const locked = await tx.$queryRaw<Array<{ id: string }>>`
            SELECT id FROM products
            WHERE id = ${productId}
            FOR UPDATE
        `;

            if (locked.length === 0) {
                throw new NotFoundException(
                    'Không tìm thấy sản phẩm',
                );
            }

            const currentImage = await tx.productImage.findFirst({
                where: {
                    id: imageId,
                    productId,
                },
            });

            if (!currentImage) {
                throw new NotFoundException(
                    'Không tìm thấy ảnh sản phẩm',
                );
            }

            if (currentImage.isPrimary) {
                throw new ConflictException(
                    'Không thể xóa ảnh đại diện. Vui lòng chọn ảnh khác làm đại diện trước.',
                );
            }

            await tx.productImage.delete({
                where: {
                    id: imageId,
                },
            });

            await this.imageKitCleanup.enqueueDeleteFile(
                productId,
                currentImage.fileId,
                tx,
            );
        });

        return {
            message: 'Đã xóa ảnh thành công',
        };
    }


}
