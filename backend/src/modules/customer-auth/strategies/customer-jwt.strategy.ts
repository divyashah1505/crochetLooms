import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomersService } from '../../customers/customers.service';
import { jwtConfig } from '../../../config/jwt.config';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(private readonly customersService: CustomersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.customerSecret,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (payload.role !== 'customer') {
      throw new UnauthorizedException('Invalid customer token');
    }
    const customer = await this.customersService.findById(payload.sub);
    if (!customer) {
      throw new UnauthorizedException('Customer account not found');
    }
    return customer;
  }
}
