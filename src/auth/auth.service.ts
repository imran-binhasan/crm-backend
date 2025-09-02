import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginInput, RegisterInput } from './dto/auth.input';
import { AuthResponse } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.validateUser(loginInput.email, loginInput.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerInput.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Get default role (assuming there's a "User" role)
    const defaultRole = await this.prisma.role.findFirst({
      where: { name: 'User' }
    });

    if (!defaultRole) {
      throw new Error('Default role not found');
    }

    // Create user
    const user = await this.usersService.create({
      ...registerInput,
      roleId: defaultRole.id,
    });

    const { password, ...userWithoutPassword } = user;

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword as any,
    };
  }

  async hasPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user) return false;

    const userPermissions = user.role.permissions.map(rp => 
      `${rp.permission.resource}:${rp.permission.action}`
    );

    return permissions.every(permission => userPermissions.includes(permission));
  }
}
