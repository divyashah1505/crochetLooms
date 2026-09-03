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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AdminJwtGuard)
  async create(@Body() createDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createDto);
    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  @Put(':id')
  @UseGuards(AdminJwtGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateDto);
    return {
      message: 'Category updated successfully',
      data: category,
    };
  }

  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return {
      message: 'Category deleted successfully',
    };
  }
}
