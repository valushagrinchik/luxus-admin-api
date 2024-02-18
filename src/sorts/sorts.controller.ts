import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
} from '@nestjs/common';
import { SortsService } from './sorts.service';
import { Sort } from './entities/sort.entity';
import { CreateSortDto } from './dto/create-sort.dto';
import { UpdateSortDto } from './dto/update-sort.dto';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';

@Controller('sorts')
export class SortsController {
  constructor(private readonly sortsService: SortsService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() createSortDto: CreateSortDto) {
    const sort = await this.sortsService.create(createSortDto);
    return new Sort(sort);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSortDto: UpdateSortDto) {
    const sort = await this.sortsService.update(+id, updateSortDto);
    return new Sort(sort);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post(':id')
  async cancel(@Req() request: Request, @Param('id') id: string) {
    const user = new AuthorizedUser(request['user']);
    await this.sortsService.cancel(+id, user);
    return { sort: id };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async remove(@Req() request: Request, @Param('id') id: string) {
    const user = new AuthorizedUser(request['user']);
    if (user.isAdmin()) {
      await this.sortsService.adminRemove(+id, user.id);
    } else {
      await this.sortsService.remove(+id, user.id);
    }
    return { sort: id };
  }
}
