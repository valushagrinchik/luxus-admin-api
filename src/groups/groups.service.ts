import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category, Group, Prisma, Sort } from '@prisma/client';
import { ERROR_CODES, ERROR_MESSAGES } from 'src/constants';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';
import { Workbook } from 'exceljs';
import { orderBy } from 'lodash';

type FullGroupsArray = (Group & {
  categories: (Category & { sorts: Sort[] })[];
})[];

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
    offset?: number;
    limit?: number;
  }): Promise<FullGroupsArray> {
    const res = await this.prisma.group.findMany({
      ...this.buildSearchParams(filter),
      orderBy: {
        name: 'asc',
      },
      ...(filter.offset ? { skip: +filter.offset } : {}),
      ...(filter.limit ? { take: +filter.limit } : {}),
    });
    return orderBy(res, [(group) => group.name.toLowerCase()], ['asc']).map(
      (group) => ({
        ...group,
        categories: orderBy(
          group.categories,
          [(cat) => cat.name.toLowerCase()],
          ['asc'],
        ).map((cat) => ({
          ...cat,
          sorts: orderBy(
            cat.sorts,
            [(sort) => sort.name.toLowerCase()],
            ['asc'],
          ),
        })),
      }),
    );
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

  async excel(filter?: { search: string; type: string }) {
    const groups = await this.search(filter);
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sorts');
    worksheet.columns = [
      {
        header: 'Group',
        key: 'group',
        width: 32,
      },
      { header: 'Category', key: 'category', width: 32 },
      { header: 'Sort', key: 'sort', width: 32 },
    ];
    worksheet.getCell('A1').font = {
      size: 16,
      bold: true,
    };
    worksheet.getCell('B1').font = {
      size: 16,
      bold: true,
    };
    worksheet.getCell('C1').font = {
      size: 16,
      bold: true,
    };
    const data: { group: string; category: string; sort: string }[] = [];
    for (const group of groups) {
      data.push({ group: group.name, category: '', sort: '' });
      for (const category of group.categories) {
        data.push({ group: '', category: category.name, sort: '' });
        for (const sort of category.sorts) {
          data.push({ group: '', category: '', sort: sort.name });
        }
      }
    }

    data.forEach((val) => {
      worksheet.addRow(val);
    });
    // await workbook.xlsx.writeFile('./public/Profile.xlsx');
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
