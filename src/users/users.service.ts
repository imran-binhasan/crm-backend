import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { BaseService } from '../common/services/base.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UserMapper } from './mappers/user.mapper';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { PaginationOptions } from '../common/interfaces/base.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService extends BaseService<User, CreateUserInput, UpdateUserInput> {
  protected readonly resourceType = ResourceType.USER;

  constructor(
    prisma: PrismaService,
    rbacService: RbacService,
  ) {
    super(prisma, rbacService, UsersService.name);
  }

  protected mapToDomain(prismaEntity: any): User | null {
    return prismaEntity ? UserMapper.toDomain(prismaEntity) : null;
  }

  protected async performCreate(data: CreateUserInput, currentUserId: string): Promise<User> {
    // Validate input data
    if (!data.email || !data.firstName || !data.lastName || !data.password) {
      throw new BadRequestException('Required fields are missing');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role exists
    const roleExists = await this.prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!roleExists) {
      throw new BadRequestException('Invalid role ID provided');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const userData = {
      ...data,
      password: hashedPassword,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.prisma.user.create({
      data: userData,
      include: this.getIncludeRelations(),
    });

    return UserMapper.toDomain(created);
  }

  protected async performFindMany(options: any): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      ...options,
      include: this.getIncludeRelations(),
    });

    return UserMapper.toDomainArray(users);
  }

  protected async performFindUnique(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.getIncludeRelations(),
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  protected async performUpdate(id: string, data: UpdateUserInput, currentUserId: string): Promise<User> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: this.getIncludeRelations(),
    });

    return UserMapper.toDomain(updated);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.user.count(options);
  }

  private getIncludeRelations() {
    return {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      },
    };
  }

  // Additional business methods specific to users
  async findByEmail(email: string, currentUserId?: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ 
      where: { email },
      include: this.getIncludeRelations(),
    });
    
    if (!user) return null;

    // Check read permissions if currentUserId provided
    if (currentUserId) {
      const canRead = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.USER, action: ActionType.READ },
        user,
      );
      if (!canRead) {
        throw new ForbiddenException(
          'Insufficient permissions to view this user',
        );
      }
    }

    return UserMapper.toDomain(user);
  }

  // Special method for authentication - returns user with password
  async findByEmailForAuth(email: string): Promise<any> {
    return this.prisma.user.findUnique({ 
      where: { email },
      include: this.getIncludeRelations(),
    });
  }

  // Method to create user without currentUserId (for registration)
  async createForRegistration(data: CreateUserInput): Promise<User> {
    // Validate input data
    if (!data.email || !data.firstName || !data.lastName || !data.password) {
      throw new BadRequestException('Required fields are missing');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role exists
    const roleExists = await this.prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!roleExists) {
      throw new BadRequestException('Invalid role ID provided');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const userData = {
      ...data,
      password: hashedPassword,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.prisma.user.create({
      data: userData,
      include: this.getIncludeRelations(),
    });

    return UserMapper.toDomain(created);
  }

  // Method to find user for JWT validation
  async findByIdForAuth(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.getIncludeRelations(),
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async findActiveUsers(
    currentUserId: string,
    pagination?: PaginationOptions,
  ): Promise<User[]> {
    await this.checkPermission(currentUserId, ActionType.READ);

    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      ResourceType.USER,
    );

    const limit = pagination?.limit;
    const skip = pagination?.page && pagination?.limit ? (pagination.page - 1) * pagination.limit : undefined;

    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...filters,
      },
      include: this.getIncludeRelations(),
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    return UserMapper.toDomainArray(users);
  }

  async getUsersByRole(
    roleId: string,
    currentUserId: string,
    pagination?: PaginationOptions,
  ): Promise<User[]> {
    await this.checkPermission(currentUserId, ActionType.READ);

    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      ResourceType.USER,
    );

    const limit = pagination?.limit;
    const skip = pagination?.page && pagination?.limit ? (pagination.page - 1) * pagination.limit : undefined;

    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        roleId,
        ...filters,
      },
      include: this.getIncludeRelations(),
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    return UserMapper.toDomainArray(users);
  }

  async assignRole(
    userId: string,
    roleId: string,
    currentUserId: string,
  ): Promise<User> {
    // Check assign permissions
    const canAssign = await this.rbacService.hasPermission(currentUserId, {
      resource: ResourceType.USER,
      action: ActionType.UPDATE,
    });
    if (!canAssign) {
      throw new ForbiddenException(
        'Insufficient permissions to assign roles',
      );
    }

    // Validate role exists
    const roleExists = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!roleExists) {
      throw new BadRequestException('Invalid role ID provided');
    }

    // Update user role
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { 
        roleId,
        updatedAt: new Date(),
      },
      include: this.getIncludeRelations(),
    });

    this.logger.log(
      `Role ${roleId} assigned to user ${userId} by ${currentUserId}`,
    );

    return UserMapper.toDomain(updatedUser);
  }

  async toggleUserStatus(
    userId: string,
    currentUserId: string,
  ): Promise<User> {
    const existingUser = await this.findOne(userId, currentUserId);
    
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { 
        isActive: !existingUser.isActive,
        updatedAt: new Date(),
      },
      include: this.getIncludeRelations(),
    });

    this.logger.log(
      `User ${userId} status toggled to ${updatedUser.isActive} by ${currentUserId}`,
    );

    return UserMapper.toDomain(updatedUser);
  }

  async changePassword(
    userId: string,
    newPassword: string,
    currentUserId: string,
  ): Promise<boolean> {
    // Check if user can update this user
    await this.findOne(userId, currentUserId);
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    this.logger.log(
      `Password changed for user ${userId} by ${currentUserId}`,
    );

    return true;
  }

  async getUserWithFullProfile(
    userId: string,
    currentUserId: string,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check read permissions
    const canRead = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.USER, action: ActionType.READ },
      user,
    );
    if (!canRead) {
      throw new ForbiddenException(
        'Insufficient permissions to view this user profile',
      );
    }

    return UserMapper.toDomain(user);
  }
}
