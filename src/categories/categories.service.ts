import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';
import { ERROR_CODES, ERROR_MESSAGES } from 'src/constants';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter?: { name: string }) {
    return this.prisma.category.findMany({
      where: {
        deleted: false,
        ...(filter
          ? {
              name: {
                search: filter.name,
              },
            }
          : {}),
      },
    });
  }

  create(data: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        group: {
          connect: {
            id: data.groupId,
          },
        },
      },
    });
  }

  update(id: number, data: UpdateCategoryDto) {
    return this.prisma.category.update({
      data: {
        name: data.name,
        ...(data.groupId
          ? {
              group: {
                connect: { id: data.groupId },
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
    return this.prisma.category.update({
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
    return this.prisma.category.update({
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
    const category = await this.prisma.category.findUnique({
      where: { id, deleted: false },
    });
    if (!category) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: ERROR_CODES.CATEGORY_NOT_FOUND,
          message: [ERROR_MESSAGES[ERROR_CODES.CATEGORY_NOT_FOUND]],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.prisma.category.update({
      data: {
        // true means that admin approved the operation
        deleted: true,
        // set deletedAt and deletedBy if admin initiated removing or leave as is if not
        deletedAt: category.deletedAt || new Date(),
        deletedBy: category.deletedBy || userId,
      },
      where: {
        id,
      },
    });
  }
}
