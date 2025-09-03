import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { LoginInput, RegisterInput } from './dto/auth.input';
import { ChangePasswordInput, RefreshTokenInput } from './dto/auth-extra.input';
import { AuthResponse } from './dto/auth-response.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailForAuth(email);
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
    const existingUser = await this.usersService.findByEmail(
      registerInput.email,
    );
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Get default role (assuming there's a "User" role)
    const defaultRole = await this.prisma.role.findFirst({
      where: { name: 'User' },
    });

    if (!defaultRole) {
      throw new Error('Default role not found');
    }

    // Create user
    const user = await this.usersService.createForRegistration({
      ...registerInput,
      roleId: defaultRole.id,
    });

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: user,
    };
  }

  async changePassword(
    userId: string,
    changePasswordInput: ChangePasswordInput,
  ): Promise<boolean> {
    try {
      // Get user with password for validation
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordInput.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password and update
      const hashedNewPassword = await bcrypt.hash(changePasswordInput.newPassword, 12);
      
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Password changed for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to change password: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(refreshTokenInput: RefreshTokenInput): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshTokenInput.refreshToken);
      
      // Get user
      const user = await this.usersService.findByIdForAuth(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const payload = { email: user.email, sub: user.id };
      const newAccessToken = this.jwtService.sign(payload);
      const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      this.logger.log(`Token refreshed for user ${user.id}`);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: user,
      };
    } catch (error) {
      this.logger.error(`Failed to refresh token: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUserToken(token: string): Promise<User | null> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findByIdForAuth(decoded.sub);
      return user;
    } catch (error) {
      return null;
    }
  }

  async logout(userId: string): Promise<boolean> {
    // In a more complete implementation, you might want to blacklist tokens
    // or store refresh tokens in database for revocation
    this.logger.log(`User ${userId} logged out`);
    return true;
  }

  async getCurrentUserProfile(userId: string): Promise<User> {
    const user = await this.usersService.findOne(userId, userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async getCurrentUserPermissions(userId: string): Promise<any[]> {
    try {
      const permissions = await this.rbacService.getUserPermissions(userId);
      return permissions;
    } catch (error) {
      this.logger.error(`Failed to get user permissions: ${error.message}`);
      return [];
    }
  }

  async hasPermissions(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    return this.rbacService.hasAllPermissions(
      userId,
      permissions.map((p) => {
        const [resource, action] = p.split(':');
        return {
          resource: resource as any,
          action: action as any,
        };
      }),
    );
  }
}
