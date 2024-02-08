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
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(@Param('name') name: string): Promise<Group[]> {
    const groups = await this.groupsService.findAll({ name });
    return groups.map((group) => new Group(group));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() createGroupDto: CreateGroupDto) {
    const group = await this.groupsService.create(createGroupDto);
    return new Group(group);
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

  @Post(':id')
  async cancel(@Req() request: Request, @Param('id') id: string) {
    const user = new AuthorizedUser(request['user']);
    await this.groupsService.cancel(+id, user);
    return { group: id };
  }

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
