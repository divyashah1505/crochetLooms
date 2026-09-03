import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';
import { CustomerJwtGuard } from '../../common/guards/customer-jwt.guard';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { Customer } from '../customers/entities/customer.entity';

@Controller('addresses')
@UseGuards(CustomerJwtGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async findAll(@CurrentCustomer() customer: Customer) {
    return this.addressesService.findAll(customer.id);
  }

  @Get(':id')
  async findOne(
    @CurrentCustomer() customer: Customer,
    @Param('id') id: string,
  ) {
    return this.addressesService.findOne(customer.id, id);
  }

  @Post()
  async create(
    @CurrentCustomer() customer: Customer,
    @Body() dto: CreateAddressDto,
  ) {
    const address = await this.addressesService.create(customer.id, dto);
    return {
      message: 'Address created successfully',
      data: address,
    };
  }

  @Put(':id')
  async update(
    @CurrentCustomer() customer: Customer,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.addressesService.update(customer.id, id, dto);
    return {
      message: 'Address updated successfully',
      data: address,
    };
  }

  @Delete(':id')
  async remove(
    @CurrentCustomer() customer: Customer,
    @Param('id') id: string,
  ) {
    await this.addressesService.remove(customer.id, id);
    return {
      message: 'Address deleted successfully',
    };
  }

  @Patch(':id/default')
  async setDefault(
    @CurrentCustomer() customer: Customer,
    @Param('id') id: string,
  ) {
    const address = await this.addressesService.setDefault(customer.id, id);
    return {
      message: 'Default address updated',
      data: address,
    };
  }
}
