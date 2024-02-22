import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ERROR_CODES, ERROR_MESSAGES } from 'src/constants';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';

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

  buildSearchParams = (filter?: { search: string; type: string }) => {
    return {
      where: {
        deleted: false,

        ...(filter.type === 'group' && filter.search
          ? {
              name: {
                contains: filter.search,
                mode: Prisma.QueryMode.insensitive,
              },
            }
          : {}),

        ...(filter.type === 'category' && filter.search
          ? {
              categories: {
                some: {
                  deleted: false,
                  name: {
                    contains: filter.search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              },
            }
          : {}),
        ...(filter.type === 'sort' && filter.search
          ? {
              categories: {
                some: {
                  deleted: false,
                  sorts: {
                    some: {
                      deleted: false,
                      name: {
                        contains: filter.search,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  },
                },
              },
            }
          : {}),
      },
      include: {
        categories: {
          where: {
            deleted: false,
            ...(filter.type === 'category' && filter.search
              ? {
                  name: {
                    contains: filter.search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                }
              : {}),
          },
          include: {
            sorts: {
              where: {
                deleted: false,
                ...(filter.type === 'sort' && filter.search
                  ? {
                      name: {
                        contains: filter.search,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    }
                  : {}),
              },
            },
          },
        },
      },
    };
  };

  async searchTotal(filter?: { search: string; type: string }) {
    const params: Prisma.GroupFindManyArgs = this.buildSearchParams(filter);
    const res = await this.prisma.group.findMany(params);
    return res.length;
  }

  async search(filter?: {
    search: string;
    type: string;
    offset: number;
    limit: number;
  }) {
    const params: Prisma.GroupFindManyArgs = this.buildSearchParams(filter);
    return this.prisma.group.findMany({
      ...params,
      orderBy: {
        name: 'asc',
      },
      skip: +filter.offset,
      take: +filter.limit,
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

  cancel(id: number, user: AuthorizedUser) {
    return this.prisma.group.update({
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
        name: `${group.name}_${new Date().getTime()}`,
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
