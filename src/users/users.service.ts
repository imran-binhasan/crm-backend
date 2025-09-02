import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(data: CreateUserInput, currentUserId?: string): Promise<User> {
    // Check permissions if currentUserId is provided
    if (currentUserId) {
      const canCreate = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.USER, action: ActionType.CREATE }
      );
      if (!canCreate) {
        throw new ForbiddenException('Insufficient permissions to create user');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findAll(currentUserId?: string): Promise<User[]> {
    let whereClause = {};

    if (currentUserId) {
      // Apply permission-based filtering
      whereClause = await this.rbacService.getPermissionFilters(
        currentUserId,
        ResourceType.USER
      );
    }

    return this.prisma.user.findMany({
      where: whereClause,
    });
  }

  async findOne(id: string, currentUserId?: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Check read permissions
    if (currentUserId) {
      const canRead = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.USER, action: ActionType.READ },
        user
      );
      if (!canRead) {
        throw new ForbiddenException('Insufficient permissions to view this user');
      }
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: UpdateUserInput, currentUserId?: string): Promise<User> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new NotFoundException('User not found');

    // Check update permissions
    if (currentUserId) {
      const canUpdate = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.USER, action: ActionType.UPDATE },
        existingUser
      );
      if (!canUpdate) {
        throw new ForbiddenException('Insufficient permissions to update this user');
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
        existingUser
      );
      if (!canDelete) {
        throw new ForbiddenException('Insufficient permissions to delete this user');
      }
    }

    return this.prisma.user.delete({ where: { id } });
  }

  async assignRole(userId: string, roleId: string, currentUserId?: string): Promise<User> {
    // Check assign permissions
    if (currentUserId) {
      const canAssign = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.USER, action: ActionType.ASSIGN }
      );
      if (!canAssign) {
        throw new ForbiddenException('Insufficient permissions to assign roles');
      }
    }

    // For now, let's use a raw query approach
    return this.prisma.$queryRaw`
      UPDATE users SET "roleId" = ${roleId} WHERE id = ${userId} RETURNING *
    ` as any;
  }
}
