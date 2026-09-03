import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import { Admin } from '../admins/entities/admin.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AdminJwtGuard)
  async create(
    @Body() createDto: CreateProductDto,
    @CurrentAdmin() admin: Admin,
  ) {
    const product = await this.productsService.create(createDto, admin.id);
    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  @Put(':id')
  @UseGuards(AdminJwtGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateDto);
    return {
      message: 'Product updated successfully',
      data: product,
    };
  }

  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return {
      message: 'Product deleted successfully',
    };
  }
}
