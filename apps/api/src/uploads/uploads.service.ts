import {
    Injectable,
    BadGatewayException,
    BadRequestException,
    ConflictException,
    NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import ImageKit, { toFile } from '@imagekit/nodejs';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UploadsService {
    private readonly imageKit: ImageKit;

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.imageKit = new ImageKit({
            privateKey:
                this.config.getOrThrow<string>(
                    'IMAGEKIT_PRIVATE_KEY'
                ),
        });
    }

    private async getProduct(productId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException('Không tìm thấy sản phẩm')
        }

        return product;
    }

    private async getImage(
        productId: string,
        imageId: string
    ) {
        const image = await this.prisma.productImage.findFirst({
            where: { id: imageId, productId }
        });

        if (!image) {
            throw new NotFoundException('Không tìm thấy ảnh sản phẩm');
        }

        return image;
    }

    private async deleteRemoteFile(fileId: string) {
        const key = this.config.getOrThrow<string>(
            'IMAGEKIT_PRIVATE_KEY'
        );

        const response = await fetch(
            `https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization:
                        `Basic ${Buffer.from(`${key}:`).toString(`base64`)}`
                },
                signal: AbortSignal.timeout(15000),
            },
        );

        if (!response.ok && response.status !== 404) {
            throw new BadGatewayException('Không thể xóa ảnh trên ImageKit');
        }
    }

    async upload(
        productId: string,
        file: Express.Multer.File | undefined,
    ) {
        await this.getProduct(productId);

        if (!file) {
            throw new BadRequestException('Vui lòng chọn ảnh');
        }

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException('Chỉ hỗ trợ JPG, PNG, WEBP');
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException('Ảnh không được vượt quá 5MB');
        }

        const b = file.buffer;
        const isJpeg = b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
        const isPng = b.length >= 8 && b.subarray(0, 8).equals(
            Buffer.from([
                137, 80, 78, 71, 13, 10, 26, 10,
            ]),
        );
        const isWebp = b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';
        const valid = (file.mimetype === 'image/jpeg' && isJpeg) || (file.mimetype === 'image/png' && isPng) || (file.mimetype === 'image/webp' && isWebp);

        if (!valid) {
            throw new BadRequestException('Nội dung file ảnh không hợp lệ');
        }

        const extension = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg'

        const fileName = `${randomUUID()}.${extension}`;
        const folder = `${this.config.get<string>('IMAGEKIT_FOLDER') ?? '/chogiaycu/products'}/${productId}`;

        let uploaded: Awaited<
            ReturnType<typeof this.imageKit.files.upload>
        >;

        try {
            uploaded = await this.imageKit.files.upload({
                file: await toFile(file.buffer, fileName),
                fileName,
                folder,
                useUniqueFileName: true,
            });
        } catch {
            throw new BadGatewayException('Upload ảnh lên ImageKit thất bại');
        }

        if (!uploaded.fileId || !uploaded.url) {
            throw new BadGatewayException('ImageKit trả về thông tin ảnh không hợp lệ');
        }

        try {
            const count = await this.prisma.productImage.count({
                where: { productId }
            });

            return await this.prisma.productImage.create({
                data: {
                    productId,
                    fileId: uploaded.fileId,
                    url: uploaded.url,
                    alt: file.originalname,
                    sortOrder: count,
                    isPrimary: count === 0,
                },
            });
        } catch (error) {
            await this.deleteRemoteFile(uploaded.fileId).catch(() => undefined);

            throw error;
        }
    }

    async setPrimary(
        productId: string,
        imageId: string
    ) {
        await this.getImage(productId, imageId);

        return this.prisma.$transaction(async (tx) => {
            await tx.productImage.updateMany({
                where: { productId },
                data: { isPrimary: false }
            });

            return tx.productImage.update({
                where: { id: imageId },
                data: { isPrimary: true }
            });
        });
    }

    async remove(
        productId: string,
        imageId: string
    ) {
        const image = await this.getImage(
            productId, imageId
        );

        await this.deleteRemoteFile(image.fileId);

        await this.prisma.$transaction(async (tx) => {
            await tx.productImage.delete({
                where: { id: imageId }
            });

            if (image.isPrimary) {
                const nextImage = await tx.productImage.findFirst({
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
