import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto } from './dto/create-tag.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AdminJwtGuard)
  async create(@Body() createDto: CreateTagDto) {
    const tag = await this.tagsService.create(createDto);
    return {
      message: 'Tag created successfully',
      data: tag,
    };
  }

  @Put(':id')
  @UseGuards(AdminJwtGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTagDto,
  ) {
    const tag = await this.tagsService.update(id, updateDto);
    return {
      message: 'Tag updated successfully',
      data: tag,
    };
  }

  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  async remove(@Param('id') id: string) {
    await this.tagsService.remove(id);
    return {
      message: 'Tag deleted successfully',
    };
  }
}
