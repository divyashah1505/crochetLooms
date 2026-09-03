import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseGuards(AdminJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Please select a file to upload');
    }
    const result = await this.uploadsService.uploadFile(file);
    return {
      message: 'Image uploaded successfully',
      data: result,
    };
  }

  @Post('images')
  @UseGuards(AdminJwtGuard)
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Please select at least one file to upload');
    }
    const results = await Promise.all(
      files.map((file) => this.uploadsService.uploadFile(file)),
    );
    return {
      message: 'Images uploaded successfully',
      data: results,
    };
  }
}
