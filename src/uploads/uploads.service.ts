import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR_CODES, ERROR_MESSAGES } from 'src/constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  async upload(file: Express.Multer.File) {
    const upload = await this.prisma.uploads.create({
      data: {
        name: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      },
    });
    return upload;
  }

  async findOne(id: number) {
    const upload = await this.prisma.uploads.findUnique({
      where: { id },
    });
    if (!upload) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: ERROR_CODES.UPLOAD_NOT_FOUND,
        message: [ERROR_MESSAGES[ERROR_CODES.UPLOAD_NOT_FOUND]],
      });
    }
    return upload;
  }
  async delete(id: number) {
    return this.prisma.uploads.delete({
      where: { id },
    });
  }
}
