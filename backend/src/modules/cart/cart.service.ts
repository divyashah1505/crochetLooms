import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(customerId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { customerId },
      relations: ['items', 'items.product', 'items.product.images', 'items.product.category'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ customerId });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async getCartSummary(customerId: string) {
    const cart = await this.getOrCreateCart(customerId);

    const items = cart.items || [];
    let subtotal = 0;
    let totalItems = 0;

    const formattedItems = items.map((item) => {
      const price = Number(item.product?.price || 0);
      const lineTotal = price * item.quantity;
      subtotal += lineTotal;
      totalItems += item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product?.id,
          name: item.product?.name,
          slug: item.product?.slug,
          price: item.product?.price,
          stock: item.product?.stock,
          images: item.product?.images || [],
          category: item.product?.category,
        },
        quantity: item.quantity,
        price,
        lineTotal,
      };
    });

    return {
      id: cart.id,
      customerId: cart.customerId,
      items: formattedItems,
      totalItems,
      subtotal: Number(subtotal.toFixed(2)),
      shippingFee: subtotal > 1000 || subtotal <= 50 || totalItems === 0 ? 0 : 50,
      totalAmount: Number((subtotal + (subtotal > 1000 || subtotal <= 50 || totalItems === 0 ? 0 : 50)).toFixed(2)),
    };
  }

  async addItem(customerId: string, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(customerId);
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('This product is currently not available for purchase');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException(`Only ${product.stock} items in stock`);
    }

    let existingItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId: dto.productId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Cannot add more than available stock (${product.stock})`);
      }
      existingItem.quantity = newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getCartSummary(customerId);
  }

  async updateItem(customerId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(customerId);
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: ['product'],
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.product.stock < dto.quantity) {
      throw new BadRequestException(`Only ${item.product.stock} items available in stock`);
    }

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);

    return this.getCartSummary(customerId);
  }

  async removeItem(customerId: string, itemId: string) {
    const cart = await this.getOrCreateCart(customerId);
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(item);
    return this.getCartSummary(customerId);
  }

  async clearCart(customerId: string) {
    const cart = await this.getOrCreateCart(customerId);
    await this.cartItemRepository.delete({ cartId: cart.id });
    return this.getCartSummary(customerId);
  }
}
