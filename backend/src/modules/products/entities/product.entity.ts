import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Admin } from '../../admins/entities/admin.entity';
import { ProductImage } from './product-image.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice?: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ name: 'created_by_admin_id', nullable: true })
  createdByAdminId?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  // Artisanal Detailed Specifications
  @Column({ nullable: true })
  materials?: string; // e.g. "100% Organic Milk Cotton, Brass Hardware"

  @Column({ nullable: true })
  dimensions?: string; // e.g. "25cm (H) x 20cm (W) x 8cm (D)"

  @Column({ name: 'care_instructions', type: 'text', nullable: true })
  careInstructions?: string; // e.g. "Gentle hand wash in cold water, dry flat in shade"

  @Column({ name: 'crafting_time', nullable: true })
  craftingTime?: string; // e.g. "Handmade in 5 hours by master artisan"

  @Column({ nullable: true })
  weight?: string; // e.g. "250g"

  @Column({ nullable: true })
  sku?: string; // e.g. "CR-BAG-001"

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Admin, (admin) => admin.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by_admin_id' })
  createdByAdmin?: Admin;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @ManyToMany(() => Tag, (tag) => tag.products, { cascade: true })
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @OneToMany(() => CartItem, (item) => item.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
