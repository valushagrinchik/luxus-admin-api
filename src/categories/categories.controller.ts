import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(@Query() search: { groupId: number }): Promise<Category[]> {
    const categories = await this.categoriesService.findAll(search);
    return categories.map((category) => new Category(category));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(
      +id,
      updateCategoryDto,
    );
    return new Category(category);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return new Category(category);
  }

  @Post(':id')
  async cancel(@Req() request: Request, @Param('id') id: string) {
    const user = new AuthorizedUser(request['user']);
    await this.categoriesService.cancel(+id, user);
    return { category: id };
  }

  @Delete(':id')
  async remove(@Req() request: Request, @Param('id') id: string) {
    const user = new AuthorizedUser(request['user']);
    if (user.isAdmin()) {
      await this.categoriesService.adminRemove(+id, user.id);
    } else {
      await this.categoriesService.remove(+id, user.id);
    }
    return { category: id };
  }
}
