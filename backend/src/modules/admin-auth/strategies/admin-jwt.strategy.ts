import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminsService } from '../../admins/admins.service';
import { jwtConfig } from '../../../config/jwt.config';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private readonly adminsService: AdminsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.adminSecret,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (payload.role !== 'admin') {
      throw new UnauthorizedException('Invalid admin credentials');
    }
    const admin = await this.adminsService.findById(payload.sub);
    if (!admin) {
      throw new UnauthorizedException('Admin account not found');
    }
    return admin;
  }
}
