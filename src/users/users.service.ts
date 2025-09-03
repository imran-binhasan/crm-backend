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
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { SafeUser, UserWithRole } from '../common/interfaces/user.interface';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(data: CreateUserInput, currentUserId?: string): Promise<User> {
    try {
      // Check permissions if currentUserId is provided
      if (currentUserId) {
        const canCreate = await this.rbacService.hasPermission(currentUserId, {
          resource: ResourceType.USER,
          action: ActionType.CREATE,
        });
        if (!canCreate) {
          throw new ForbiddenException(
            'Insufficient permissions to create user',
          );
        }
      }

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

      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      this.logger.log(
        `User created: ${user.email} by ${currentUserId || 'system'}`,
      );
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<SafeUser[]> {
    try {
      this.logger.log('Finding all users', { currentUserId, take, skip });

      // Check if user has permission to read users
      const hasPermission = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.USER, action: ActionType.READ },
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          'Insufficient permissions to access users',
        );
      }

      // Get permission filters for user resource
      const filters = await this.rbacService.getPermissionFilters(
        currentUserId,
        ResourceType.USER,
      );

      const users = await this.prisma.user.findMany({
        where: {
          deletedAt: null,
          ...filters,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          image: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log('Successfully retrieved users', { count: users.length });

      // Transform to SafeUser format
      return users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        image: user.image,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role,
      })) as SafeUser[];
    } catch (error) {
      this.logger.error('Error finding users', {
        error: error.message,
        currentUserId,
      });
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  async findOne(id: string, currentUserId?: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Check read permissions
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

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(
    id: string,
    data: UpdateUserInput,
    currentUserId?: string,
  ): Promise<User> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new NotFoundException('User not found');

    // Check update permissions
    if (currentUserId) {
      const canUpdate = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.USER, action: ActionType.UPDATE },
        existingUser,
      );
      if (!canUpdate) {
        throw new ForbiddenException(
          'Insufficient permissions to update this user',
        );
      }
    }

    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string, currentUserId?: string): Promise<User> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new NotFoundException('User not found');

    // Check delete permissions
    if (currentUserId) {
      const canDelete = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.USER, action: ActionType.DELETE },
        existingUser,
      );
      if (!canDelete) {
        throw new ForbiddenException(
          'Insufficient permissions to delete this user',
        );
      }
    }

    return this.prisma.user.delete({ where: { id } });
  }

  async assignRole(
    userId: string,
    roleId: string,
    currentUserId?: string,
  ): Promise<User> {
    // Check assign permissions
    if (currentUserId) {
      const canAssign = await this.rbacService.hasPermission(currentUserId, {
        resource: ResourceType.USER,
        action: ActionType.ASSIGN,
      });
      if (!canAssign) {
        throw new ForbiddenException(
          'Insufficient permissions to assign roles',
        );
      }
    }

    // For now, let's use a raw query approach
    return this.prisma.$queryRaw`
      UPDATE users SET "roleId" = ${roleId} WHERE id = ${userId} RETURNING *
    ` as any;
  }
}
