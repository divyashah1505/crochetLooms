import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Cart } from '../cart/entities/cart.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'googleId', 'avatarUrl', 'phone', 'createdAt', 'updatedAt'],
    });
  }

  async findByGoogleId(googleId: string): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: { googleId },
    });
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['addresses', 'cart'],
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async create(customerData: Partial<Customer>): Promise<Customer> {
    const existing = await this.findByEmail(customerData.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const customer = this.customerRepository.create(customerData);
    const savedCustomer = await this.customerRepository.save(customer);

    // Automatically create a cart for the new customer
    const cart = this.cartRepository.create({ customerId: savedCustomer.id });
    await this.cartRepository.save(cart);

    return savedCustomer;
  }

  async update(id: string, updateData: Partial<Customer>): Promise<Customer> {
    const customer = await this.findById(id);
    Object.assign(customer, updateData);
    return this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['addresses', 'orders'],
    });
  }
}
