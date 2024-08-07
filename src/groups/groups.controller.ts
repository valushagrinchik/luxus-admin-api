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
  Logger,
  LoggerService,
  Inject,
  StreamableFile,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';
import { Readable } from 'stream';

@Controller('groups')
export class GroupsController {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly groupsService: GroupsService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(): Promise<Group[]> {
    this.logger.log('Fetching all groups...');

    const groups = await this.groupsService.findAll();
    return groups.map((group) => new Group(group));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('excel')
  async excel(
    @Query()
    search: {
      search: string;
      type: string;
    },
  ): Promise<StreamableFile> {
    const buffer = await this.groupsService.excel(search);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return new StreamableFile(stream);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('search')
  async search(
    @Query()
    search: {
      search: string;
      type: string;
      offset: number;
      limit: number;
    },
  ): Promise<Group[]> {
    const groups = await this.groupsService.search(search);
    return groups.map((group) => new Group(group));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('search/total')
  async searchTotal(
    @Query()
    search: {
      search: string;
      type: string;
    },
  ): Promise<{ total: number }> {
    const total = await this.groupsService.searchTotal(search);
    return { total };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    const group = await this.groupsService.update(+id, updateGroupDto);
    return new Group(group);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() createGroupDto: CreateGroupDto) {
    const group = await this.groupsService.create(createGroupDto);
    return new Group(group);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post(':id/cancel')
  async cancel(@Req() request: Request, @Param('id') id: string) {
    const user = new AuthorizedUser(request['user']);
    await this.groupsService.cancel(+id, user);
    return { group: id };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async remove(@Req() request: Request, @Param('id') id: string) {
    const user = new AuthorizedUser(request['user']);
    if (user.isAdmin()) {
      await this.groupsService.adminRemove(+id, user.id);
    } else {
      await this.groupsService.remove(+id, user.id);
    }
    return { group: id };
  }
}
