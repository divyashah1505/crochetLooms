import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminsService } from '../admins/admins.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { jwtConfig } from '../../config/jwt.config';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: AdminLoginDto) {
    const admin = await this.adminsService.findByEmail(loginDto.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
    };

    const token = this.jwtService.sign(payload, {
      secret: jwtConfig.adminSecret,
      expiresIn: jwtConfig.adminExpiresIn,
    });

    return {
      message: 'Admin login successful',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
        accessToken: token,
      },
    };
  }
}
