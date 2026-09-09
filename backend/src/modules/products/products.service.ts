import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { TagsService } from '../tags/tags.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly tagsService: TagsService,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async findAll(query: QueryProductDto) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.tags', 'tags');

    if (query.isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', { isActive: query.isActive });
    } else {
      qb.andWhere('product.isActive = :isActive', { isActive: true });
    }

    if (query.isFeatured !== undefined) {
      qb.andWhere('product.isFeatured = :isFeatured', { isFeatured: query.isFeatured });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query.category) {
      qb.andWhere(
        '(CAST(category.id AS text) = :category OR category.slug = :category OR CAST(category.parentId AS text) = (SELECT CAST(c_sub.id AS text) FROM categories c_sub WHERE CAST(c_sub.id AS text) = :category OR c_sub.slug = :category LIMIT 1))',
        { category: query.category },
      );
    }

    if (query.tag) {
      const tagList = query.tag.split(',').map((t) => t.trim().toLowerCase());
      qb.andWhere(
        'product.id IN (' +
          'SELECT pt.product_id FROM product_tags pt ' +
          'INNER JOIN tags t ON t.id = pt.tag_id ' +
          'WHERE LOWER(t.slug) IN (:...tags) OR LOWER(t.name) IN (:...tags)' +
          ')',
        { tags: tagList },
      );
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.sort === 'price_asc') {
      qb.orderBy('product.price', 'ASC');
    } else if (query.sort === 'price_desc') {
      qb.orderBy('product.price', 'DESC');
    } else if (query.sort === 'featured') {
      qb.orderBy('product.isFeatured', 'DESC').addOrderBy('product.createdAt', 'DESC');
    } else {
      qb.orderBy('product.createdAt', 'DESC');
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'category.parent', 'images', 'tags', 'createdByAdmin'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category', 'category.parent', 'images', 'tags', 'createdByAdmin'],
    });
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto, adminId?: string): Promise<Product> {
    const slug = dto.slug || this.slugify(dto.name);
    const existing = await this.productRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Product with this slug or name already exists');
    }

    let tags = [];
    if (dto.tagIds && dto.tagIds.length > 0) {
      tags = await this.tagsService.findByIds(dto.tagIds);
    }

    const product = this.productRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      price: dto.price,
      compareAtPrice: dto.compareAtPrice,
      stock: dto.stock,
      categoryId: dto.categoryId,
      createdByAdminId: adminId,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      isFeatured: dto.isFeatured || false,
      materials: dto.materials,
      dimensions: dto.dimensions,
      careInstructions: dto.careInstructions,
      craftingTime: dto.craftingTime,
      weight: dto.weight,
      sku: dto.sku,
      tags,
    });

    const savedProduct = await this.productRepository.save(product);

    if (dto.images && dto.images.length > 0) {
      const images = dto.images.map((img, idx) =>
        this.productImageRepository.create({
          productId: savedProduct.id,
          imageUrl: img.imageUrl,
          publicId: img.publicId,
          displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx,
        }),
      );
      await this.productImageRepository.save(images);
    }

    return this.findOne(savedProduct.id);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.name && !dto.slug) {
      dto.slug = this.slugify(dto.name);
    }

    // Check slug collision with other products
    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.productRepository.findOne({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    if (dto.tagIds !== undefined) {
      product.tags = await this.tagsService.findByIds(dto.tagIds);
    }

    if (dto.images !== undefined) {
      await this.productImageRepository.delete({ productId: id });
      if (dto.images.length > 0) {
        const images = dto.images.map((img, idx) =>
          this.productImageRepository.create({
            productId: id,
            imageUrl: img.imageUrl,
            publicId: img.publicId,
            displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx,
          }),
        );
        await this.productImageRepository.save(images);
      }
    }

    // Explicitly update all fields on product
    product.name = dto.name !== undefined ? dto.name : product.name;
    product.slug = dto.slug !== undefined ? dto.slug : product.slug;
    product.description = dto.description !== undefined ? dto.description : product.description;
    product.price = dto.price !== undefined ? Number(dto.price) : product.price;
    product.compareAtPrice =
      dto.compareAtPrice !== undefined
        ? dto.compareAtPrice
          ? Number(dto.compareAtPrice)
          : null
        : product.compareAtPrice;
    product.stock = dto.stock !== undefined ? Number(dto.stock) : product.stock;
    product.categoryId = dto.categoryId !== undefined ? dto.categoryId : product.categoryId;
    product.isActive = dto.isActive !== undefined ? Boolean(dto.isActive) : product.isActive;
    product.isFeatured = dto.isFeatured !== undefined ? Boolean(dto.isFeatured) : product.isFeatured;
    product.materials = dto.materials !== undefined ? dto.materials : product.materials;
    product.dimensions = dto.dimensions !== undefined ? dto.dimensions : product.dimensions;
    product.careInstructions =
      dto.careInstructions !== undefined ? dto.careInstructions : product.careInstructions;
    product.craftingTime =
      dto.craftingTime !== undefined ? dto.craftingTime : product.craftingTime;
    product.weight = dto.weight !== undefined ? dto.weight : product.weight;
    product.sku = dto.sku !== undefined ? dto.sku : product.sku;

    // Remove old relation cache so TypeORM doesn't overwrite new categoryId or cascade stale images
    delete (product as any).category;
    delete (product as any).createdByAdmin;
    delete (product as any).images;

    await this.productRepository.save(product);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async reduceStock(productId: string, quantity: number): Promise<void> {
    const product = await this.findOne(productId);
    if (product.stock < quantity) {
      throw new ConflictException(`Insufficient stock for product ${product.name}`);
    }
    product.stock -= quantity;
    await this.productRepository.save(product);
  }
}
