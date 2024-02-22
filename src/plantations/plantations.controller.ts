import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { PlantationsService } from './plantations.service';
import { CreatePlantationDto } from './dto/create-plantation.dto';
import { UpdatePlantationDto } from './dto/update-plantation.dto';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';
import { Plantation } from './entities/plantation.entity';
import { FilterPlantationDto } from './dto/filter-plantation.dto';
import { Readable } from 'stream';

@Controller('plantations')
export class PlantationsController {
  constructor(private readonly plantationsService: PlantationsService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  create(@Body() createPlantationDto: CreatePlantationDto) {
    return this.plantationsService.create(createPlantationDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  findAll() {
    return this.plantationsService.findAll();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('excel')
  async excel(
    @Query()
    search: FilterPlantationDto,
  ): Promise<StreamableFile> {
    const buffer = await this.plantationsService.excel(search);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return new StreamableFile(stream);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('search')
  async search(
    @Query()
    search: FilterPlantationDto & {
      offset: number;
      limit: number;
    },
  ): Promise<Plantation[]> {
    const plantations = await this.plantationsService.search(search);
    return plantations.map((plantation) => new Plantation(plantation));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('search/total')
  async searchTotal(
    @Query()
    search: FilterPlantationDto,
  ): Promise<{ total: number }> {
    const total = await this.plantationsService.searchTotal(search);
    return { total };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantationsService.findOne(+id);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlantationDto: UpdatePlantationDto,
  ) {
    const res = await this.plantationsService.update(+id, updatePlantationDto);
    return res;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post(':id')
  async cancel(@Req() request: Request, @Param('id') id: string) {
    const user = new AuthorizedUser(request['user']);
    await this.plantationsService.cancel(+id, user);
    return { plantation: id };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async remove(@Req() request: Request, @Param('id') id: string) {
    const user = new AuthorizedUser(request['user']);
    if (user.isAdmin()) {
      await this.plantationsService.adminRemove(+id, user.id);
    } else {
      await this.plantationsService.remove(+id, user.id);
    }
    return { plantation: id };
  }
}
