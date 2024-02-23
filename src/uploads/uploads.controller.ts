import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Upload } from './entities/Upload.entity';

@Controller('upload')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const upload = await this.uploadsService.upload(file);
    return new Upload(upload);
  }

  @Get(':id')
  async read(@Param('id') id: string): Promise<StreamableFile> {
    const upload = await this.uploadsService.findOne(+id);
    const file = createReadStream(join(process.cwd(), upload.path));
    return new StreamableFile(file);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ upload: number }> {
    await this.uploadsService.delete(+id);
    return { upload: +id };
  }
}
