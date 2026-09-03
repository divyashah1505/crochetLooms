import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async findAll(customerId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { customerId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(customerId: string, id: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, customerId },
    });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  async create(customerId: string, dto: CreateAddressDto): Promise<Address> {
    if (dto.isDefault) {
      await this.addressRepository.update(
        { customerId, isDefault: true },
        { isDefault: false },
      );
    } else {
      const count = await this.addressRepository.count({ where: { customerId } });
      if (count === 0) {
        dto.isDefault = true;
      }
    }

    const address = this.addressRepository.create({
      ...dto,
      customerId,
    });
    return this.addressRepository.save(address);
  }

  async update(
    customerId: string,
    id: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.findOne(customerId, id);

    if (dto.isDefault) {
      await this.addressRepository.update(
        { customerId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(address, dto);
    return this.addressRepository.save(address);
  }

  async remove(customerId: string, id: string): Promise<void> {
    const address = await this.findOne(customerId, id);
    await this.addressRepository.remove(address);
  }

  async setDefault(customerId: string, id: string): Promise<Address> {
    const address = await this.findOne(customerId, id);
    await this.addressRepository.update(
      { customerId, isDefault: true },
      { isDefault: false },
    );
    address.isDefault = true;
    return this.addressRepository.save(address);
  }
}
