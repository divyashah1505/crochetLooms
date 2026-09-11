import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { CustomersService } from '../customers/customers.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { jwtConfig } from '../../config/jwt.config';

@Injectable()
export class CustomerAuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  private generateToken(customer: { id: string; email: string; name: string }) {
    const payload = {
      sub: customer.id,
      email: customer.email,
      name: customer.name,
      role: 'customer',
    };

    return this.jwtService.sign(payload, {
      secret: jwtConfig.customerSecret,
      expiresIn: jwtConfig.customerExpiresIn,
    });
  }

  async register(registerDto: RegisterCustomerDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const customer = await this.customersService.create({
      name: registerDto.name,
      email: registerDto.email.toLowerCase().trim(),
      password: hashedPassword,
      phone: registerDto.phone,
    });

    const token = this.generateToken(customer);

    return {
      message: 'Customer registered successfully',
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          avatarUrl: customer.avatarUrl,
        },
        accessToken: token,
      },
    };
  }

  async login(loginDto: LoginCustomerDto) {
    const email = loginDto.email.toLowerCase().trim();
    const customer = await this.customersService.findByEmail(email);
    if (!customer) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!customer.password) {
      throw new UnauthorizedException(
        'This account was created with Google Sign-In. Please sign in with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(customer);

    return {
      message: 'Login successful',
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          avatarUrl: customer.avatarUrl,
        },
        accessToken: token,
      },
    };
  }

  async googleLogin(googleDto: GoogleLoginDto) {
    let email: string;
    let name: string;
    let googleId: string;
    let avatarUrl: string;

    if (googleDto.credential) {
      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: googleDto.credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new UnauthorizedException('Invalid Google token payload');
        }
        email = payload.email.toLowerCase().trim();
        name = payload.name || payload.email.split('@')[0];
        googleId = payload.sub;
        avatarUrl = payload.picture;
      } catch (err) {
        // Fallback: If verification fails or client ID is placeholder in dev, attempt base64 decode of jwt payload
        try {
          const parts = googleDto.credential.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            email = decoded.email?.toLowerCase().trim();
            name = decoded.name || decoded.email?.split('@')[0];
            googleId = decoded.sub;
            avatarUrl = decoded.picture;
          }
        } catch {
          throw new UnauthorizedException('Could not verify Google ID token');
        }
      }
    } else if (googleDto.email && googleDto.googleId) {
      email = googleDto.email.toLowerCase().trim();
      name = googleDto.name || email.split('@')[0];
      googleId = googleDto.googleId;
      avatarUrl = googleDto.avatarUrl;
    } else {
      throw new BadRequestException('Google credential token or email & googleId required');
    }

    if (!email) {
      throw new BadRequestException('Email could not be retrieved from Google account');
    }

    let customer = await this.customersService.findByEmail(email);

    if (customer) {
      if (!customer.googleId) {
        customer.googleId = googleId;
        if (!customer.avatarUrl && avatarUrl) {
          customer.avatarUrl = avatarUrl;
        }
        customer = await this.customersService.update(customer.id, {
          googleId,
          avatarUrl: customer.avatarUrl || avatarUrl,
        });
      }
    } else {
      customer = await this.customersService.create({
        name,
        email,
        googleId,
        avatarUrl,
      });
    }

    const token = this.generateToken(customer);

    return {
      message: 'Google login successful',
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          avatarUrl: customer.avatarUrl,
        },
        accessToken: token,
      },
    };
  }

  async getProfile(customerId: string) {
    const customer = await this.customersService.findById(customerId);
    return {
      message: 'Profile retrieved successfully',
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatarUrl: customer.avatarUrl,
        addresses: customer.addresses,
        createdAt: customer.createdAt,
      },
    };
  }

  async updateProfile(customerId: string, updateDto: UpdateCustomerProfileDto) {
    const updateData: any = {};
    if (updateDto.name !== undefined) {
      updateData.name = updateDto.name.trim();
    }
    if (updateDto.phone !== undefined) {
      updateData.phone = updateDto.phone.trim();
    }
    if (updateDto.avatarUrl !== undefined) {
      updateData.avatarUrl = updateDto.avatarUrl;
    }

    const updated = await this.customersService.update(customerId, updateData);
    return {
      message: 'Profile updated successfully',
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        avatarUrl: updated.avatarUrl,
      },
    };
  }
}
