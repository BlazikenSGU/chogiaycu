
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import ImageKit, { toFile } from '@imagekit/nodejs';

export type UploadedImageKitFile = {
  fileId: string;
  url: string;
  originalName: string;
};

@Injectable()
export class ImageKitStorageService {
  private readonly imageKit: ImageKit;

  constructor(private readonly config: ConfigService) {
    this.imageKit = new ImageKit({
      privateKey: this.config.getOrThrow<string>(
        'IMAGEKIT_PRIVATE_KEY',
      ),
    });
  }

  validateImage(file: Express.Multer.File): void {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Chỉ hỗ trợ JPG, PNG, WEBP',
      );
    }

    if (
      file.size <= 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      throw new BadRequestException(
        'Ảnh phải có dung lượng từ 1 byte đến 5MB',
      );
    }

    if (!file.buffer || file.buffer.length !== file.size) {
      throw new BadRequestException(
        'Dữ liệu file ảnh không hợp lệ',
      );
    }

    const buffer = file.buffer;

    const isJpeg =
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    const isPng =
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      );

    const isWebp =
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';

    const valid =
      (file.mimetype === 'image/jpeg' && isJpeg) ||
      (file.mimetype === 'image/png' && isPng) ||
      (file.mimetype === 'image/webp' && isWebp);

    if (!valid) {
      throw new BadRequestException(
        'Nội dung file ảnh không hợp lệ',
      );
    }
  }

  async upload(
    file: Express.Multer.File,
    productId: string,
  ): Promise<UploadedImageKitFile> {
    this.validateImage(file);

    const extension =
      file.mimetype === 'image/png'
        ? 'png'
        : file.mimetype === 'image/webp'
          ? 'webp'
          : 'jpg';

    const fileName = `${randomUUID()}.${extension}`;

    const baseFolder =
      this.config.get<string>('IMAGEKIT_FOLDER') ??
      '/chogiaycu/products';

    const folder = `${baseFolder}/${productId}`;

    let uploaded: Awaited<
      ReturnType<ImageKit['files']['upload']>
    >;

    try {
      uploaded = await this.imageKit.files.upload({
        file: await toFile(file.buffer, fileName),
        fileName,
        folder,
        useUniqueFileName: true,
      });
    } catch {
      throw new BadGatewayException(
        'Upload ảnh lên ImageKit thất bại',
      );
    }

    if (!uploaded.fileId || !uploaded.url) {
      throw new BadGatewayException(
        'ImageKit trả về thông tin ảnh không hợp lệ',
      );
    }

    return {
      fileId: uploaded.fileId,
      url: uploaded.url,
      originalName: file.originalname,
    };
  }

  async delete(fileId: string): Promise<void> {
    const key = this.config.getOrThrow<string>(
      'IMAGEKIT_PRIVATE_KEY',
    );

    let response: Response;

    try {
      response = await fetch(
        `https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${key}:`,
            ).toString('base64')}`,
          },
          signal: AbortSignal.timeout(15000),
        },
      );
    } catch {
      throw new BadGatewayException(
        'Không thể kết nối ImageKit để xóa ảnh',
      );
    }

    if (!response.ok && response.status !== 404) {
      throw new BadGatewayException(
        'Không thể xóa ảnh trên ImageKit',
      );
    }
  }


  async deleteProductFolder(productId: string): Promise<void> {
    const baseFolder =
      this.config.get<string>('IMAGEKIT_FOLDER') ??
      '/chogiaycu/products';

    const folderPath = `${baseFolder}/${productId}`;

    const key = this.config.getOrThrow<string>(
      'IMAGEKIT_PRIVATE_KEY',
    );

    let response: Response;

    try {
      response = await fetch(
        'https://api.imagekit.io/v1/folder',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${key}:`,
            ).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            folderPath,
          }),
          signal: AbortSignal.timeout(15000),
        },
      );
    } catch {
      throw new BadGatewayException(
        'Không thể kết nối ImageKit để xóa thư mục',
      );
    }

    if (!response.ok && response.status !== 404) {
      throw new BadGatewayException(
        'Không thể xóa thư mục trên ImageKit',
      );
    }
  }

  async uploadManyOrRollback(
    files: Express.Multer.File[],
    productId: string,
  ): Promise<UploadedImageKitFile[]> {
    // 1. Kiểm tra số lượng ảnh
    if (files.length > 6) {
      throw new BadRequestException(
        'Mỗi sản phẩm chỉ được tối đa 6 ảnh',
      );
    }

    // 2. Validate tất cả ảnh trước khi upload
    for (const file of files) {
      this.validateImage(file);
    }

    // 3. Không có ảnh thì trả về mảng rỗng
    if (files.length === 0) {
      return [];
    }

    // 4. Upload tất cả ảnh song song
    const results = await Promise.allSettled(
      files.map((file) => this.upload(file, productId)),
    );

    // 5. Lấy danh sách ảnh upload thành công
    const uploadedFiles = results
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<UploadedImageKitFile> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value);

    // 6. Kiểm tra có ảnh nào thất bại không
    const hasFailure = results.some(
      (result) => result.status === 'rejected',
    );


    if (hasFailure) {
      // 1. Xóa các ảnh đã upload thành công.
      const rollbackResults = await Promise.allSettled(
        uploadedFiles.map((file) =>
          this.delete(file.fileId),
        ),
      );

      const rollbackFailed = rollbackResults.some(
        (result) => result.status === 'rejected',
      );

      // 2. Chỉ dọn thư mục nếu rollback file thành công.
      if (rollbackFailed) {
        console.error(
          `[ImageKit rollback] Không xóa hết ảnh của productId=${productId}`,
        );

        throw new BadGatewayException(
          'Upload thất bại và chưa thể dọn sạch ảnh trên ImageKit',
        );
      }

      // 3. Dọn thư mục UUID của sản phẩm tạo thất bại.
      try {
        await this.deleteProductFolder(productId);
      } catch (error) {
        console.error(
          `[ImageKit rollback] Không thể xóa thư mục productId=${productId}`,
          error,
        );

        throw new BadGatewayException(
          'Upload thất bại, ảnh đã được rollback nhưng chưa thể xóa thư mục ImageKit',
        );
      }

      // 4. Thông báo lỗi upload.
      throw new BadGatewayException(
        'Upload ảnh thất bại. Đã rollback ảnh và thư mục ImageKit.',
      );
    }


    // 7. Trả về đúng thứ tự ảnh người dùng chọn
    return results.map(
      (result) =>
        (result as PromiseFulfilledResult<UploadedImageKitFile>).value,
    );
  }

}
