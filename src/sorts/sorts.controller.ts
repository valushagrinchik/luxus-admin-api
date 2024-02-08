import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { SortsService } from './sorts.service';
import { Sort } from './entities/sort.entity';
import { CreateSortDto } from './dto/create-sort.dto';
import { UpdateSortDto } from './dto/update-sort.dto';

@Controller('sorts')
export class SortsController {
  constructor(private readonly sortsService: SortsService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() data: CreateSortDto) {
    const sort = await this.sortsService.create(data);
    return new Sort(sort);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  findAll(): Promise<Sort[]> {
    return this.sortsService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateSortDto) {
    return this.sortsService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sortsService.remove(+id);
  }
}
