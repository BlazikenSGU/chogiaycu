
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import ImageKit, { toFile } from '@imagekit/nodejs';

@Injectable()
export class BrandLogoService {
  private readonly imageKit: ImageKit;

  constructor(private readonly config: ConfigService) {
    this.imageKit = new ImageKit({
      privateKey: this.config.getOrThrow<string>(
        'IMAGEKIT_PRIVATE_KEY',
      ),
    });
  }

  async upload(file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn logo');
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Logo chỉ hỗ trợ JPG, PNG, WEBP',
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException(
        'Logo không được vượt quá 2MB',
      );
    }

    const b = file.buffer;

    const isJpeg =
      b.length >= 3 &&
      b[0] === 0xff &&
      b[1] === 0xd8 &&
      b[2] === 0xff;

    const isPng =
      b.length >= 8 &&
      b.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      );

    const isWebp =
      b.length >= 12 &&
      b.toString('ascii', 0, 4) === 'RIFF' &&
      b.toString('ascii', 8, 12) === 'WEBP';

    const valid =
      (file.mimetype === 'image/jpeg' && isJpeg) ||
      (file.mimetype === 'image/png' && isPng) ||
      (file.mimetype === 'image/webp' && isWebp);

    if (!valid) {
      throw new BadRequestException(
        'Nội dung file logo không hợp lệ',
      );
    }

    const extension =
      file.mimetype === 'image/png'
        ? 'png'
        : file.mimetype === 'image/webp'
          ? 'webp'
          : 'jpg';

    const fileName = `${randomUUID()}.${extension}`;

    const folder = '/chogiaycu/brands';

    try {
      const uploaded = await this.imageKit.files.upload({
        file: await toFile(file.buffer, fileName),
        fileName,
        folder,
        useUniqueFileName: true,
      });

      if (!uploaded.fileId || !uploaded.url) {
        throw new BadGatewayException(
          'ImageKit trả về thông tin logo không hợp lệ',
        );
      }

      return {
        fileId: uploaded.fileId,
        url: uploaded.url,
      };
    } catch {
      throw new BadGatewayException(
        'Upload logo lên ImageKit thất bại',
      );
    }
  }
}
