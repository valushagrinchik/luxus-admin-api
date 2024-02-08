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
  BadRequestException,
  Req,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(): Promise<Group[]> {
    const groups = await this.groupsService.findAll();
    return groups.map((group) => new Group(group));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() createGroupDto: CreateGroupDto) {
    try {
      const group = await this.groupsService.create(createGroupDto);
      return new Group(group);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(['Такая группа уже существует'], {
            cause: error,
            description: 'ALREADY_EXISTS',
          });
        }
      }
      throw error;
    }
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    try {
      const group = await this.groupsService.update(+id, updateGroupDto);
      return new Group(group);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(['Такая группа уже существует'], {
            cause: error,
            description: 'ALREADY_EXISTS',
          });
        }
      }
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Req() request: Request, @Param('id') id: string) {
    try {
      const user = new AuthorizedUser(request['user']);
      if (user.isAdmin()) {
        await this.groupsService.adminRemove(+id, user.id);
      } else {
        await this.groupsService.remove(+id, user.id);
      }
      return { group: id };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log(error, 'error');
        if (error.code === 'P2025') {
          throw new BadRequestException(['Такой группы не существует'], {
            cause: error,
            description: 'NOT_FOUND',
          });
        }
      }
      throw error;
    }
  }
}
