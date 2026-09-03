import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto, UpdateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { name: 'ASC' },
      relations: ['products'],
    });
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) return [];
    return this.tagRepository.find({
      where: { id: In(ids) },
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['products', 'products.images', 'products.category'],
    });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { slug },
      relations: ['products', 'products.images', 'products.category'],
    });
    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }
    return tag;
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const slug = dto.slug || this.slugify(dto.name);
    const existing = await this.tagRepository.findOne({
      where: [{ name: dto.name }, { slug }],
    });
    if (existing) {
      throw new ConflictException('Tag with this name or slug already exists');
    }

    const tag = this.tagRepository.create({
      ...dto,
      slug,
    });
    return this.tagRepository.save(tag);
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    if (dto.name && !dto.slug) {
      dto.slug = this.slugify(dto.name);
    }
    Object.assign(tag, dto);
    return this.tagRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
  }
}
