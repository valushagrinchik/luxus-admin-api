import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ERROR_CODES, ERROR_MESSAGES } from 'src/constants';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.group.findMany({
      where: {
        deleted: false,
      },
    });
  }

  async create(data: Prisma.GroupCreateInput) {
    return this.prisma.group.create({
      data: {
        name: data.name,
      },
    });
  }

  update(id: number, data: Prisma.GroupUpdateInput) {
    return this.prisma.group.update({
      data,
      where: {
        id,
        deleted: false,
      },
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.group.update({
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

  async adminRemove(id: number, userId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id, deleted: false },
    });
    if (!group) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: ERROR_CODES.GROUP_NOT_FOUND,
          message: [ERROR_MESSAGES[ERROR_CODES.GROUP_NOT_FOUND]],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.prisma.group.update({
      data: {
        // true means that admin approved the operation
        deleted: true,
        // set deletedAt and deletedBy if admin initiated removing or leave as is if not
        deletedAt: group.deletedAt || new Date(),
        deletedBy: group.deletedBy || userId,
      },
      where: {
        id,
      },
    });
  }
}
