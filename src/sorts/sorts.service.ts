import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSortDto } from './dto/create-sort.dto';
import { UpdateSortDto } from './dto/update-sort.dto';

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

  async findAll() {
    return this.prisma.sort.findMany({
      where: {
        deleted: false,
      },
    });
  }

  async update(id: number, data: UpdateSortDto) {
    return this.prisma.sort.update({
      data: {
        name: data.name,
        category: {
          connect: {
            id: data.categoryId,
          },
        },
      },
      where: {
        id,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.sort.update({
      data: {
        deleted: true,
      },
      where: {
        id,
      },
    });
  }
}
