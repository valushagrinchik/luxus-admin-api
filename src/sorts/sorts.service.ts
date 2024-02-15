import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSortDto } from './dto/create-sort.dto';
import { UpdateSortDto } from './dto/update-sort.dto';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';
import { ERROR_CODES, ERROR_MESSAGES } from 'src/constants';

@Injectable()
export class SortsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSortDto) {
    return this.prisma.sort.create({
      data: {
        name: data.name,
        category: {
          connect: {
            id: data.categoryId,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateSortDto) {
    return this.prisma.sort.update({
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.categoryId
          ? {
              category: {
                connect: { id: data.categoryId },
              },
            }
          : {}),
      },
      where: {
        id,
        deleted: false,
      },
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.sort.update({
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
      where: {
        id,
        deleted: false,
      },
    });
  }

  cancel(id: number, user: AuthorizedUser) {
    return this.prisma.sort.update({
      data: {
        deletedAt: null,
        deletedBy: null,
      },
      where: {
        id,
        ...(user.isAdmin()
          ? {}
          : {
              deleted: false,
              deletedBy: user.id,
            }),
      },
    });
  }

  async adminRemove(id: number, userId: number) {
    const sort = await this.prisma.sort.findUnique({
      where: { id, deleted: false },
    });
    if (!sort) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: ERROR_CODES.SORT_NOT_FOUND,
          message: [ERROR_MESSAGES[ERROR_CODES.SORT_NOT_FOUND]],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.prisma.sort.update({
      data: {
        name: `${sort.name}_${new Date().getTime()}`,
        // true means that admin approved the operation
        deleted: true,
        // set deletedAt and deletedBy if admin initiated removing or leave as is if not
        deletedAt: sort.deletedAt || new Date(),
        deletedBy: sort.deletedBy || userId,
      },
      where: {
        id,
      },
    });
  }
}
