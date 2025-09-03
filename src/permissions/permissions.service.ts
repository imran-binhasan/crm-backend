import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { BaseService } from '../common/services/base.service';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { Permission } from './entities/permission.entity';
import { PermissionMapper } from './mappers/permission.mapper';
import { ResourceType, ActionType } from '../common/rbac/permission.types';

@Injectable()
export class PermissionsService extends BaseService<Permission, CreatePermissionInput, UpdatePermissionInput> {
  protected readonly resourceType = ResourceType.PERMISSION;

  constructor(
    prisma: PrismaService,
    rbacService: RbacService,
  ) {
    super(prisma, rbacService, PermissionsService.name);
  }

  protected mapToDomain(prismaEntity: any): Permission | null {
    return PermissionMapper.toDomain(prismaEntity);
  }

  protected async performCreate(data: CreatePermissionInput, currentUserId: string): Promise<Permission> {
    const permissionData = {
      resource: data.resource,
      action: data.action,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.prisma.permission.create({
      data: permissionData,
    });

    return this.mapToDomain(created)!;
  }

  protected async performUpdate(id: string, data: UpdatePermissionInput, currentUserId: string): Promise<Permission> {
    const updateData: any = {};

    if (data.resource) updateData.resource = data.resource;
    if (data.action) updateData.action = data.action;
    if (data.description !== undefined) updateData.description = data.description;
    updateData.updatedAt = new Date();

    const updated = await this.prisma.permission.update({
      where: { id },
      data: updateData,
    });

    return this.mapToDomain(updated)!;
  }

  protected async performFindMany(options: any): Promise<Permission[]> {
    const { where, orderBy, take, skip } = options;

    const data = await this.prisma.permission.findMany({
      where,
      orderBy: orderBy || { createdAt: 'desc' },
      take,
      skip,
    });

    return PermissionMapper.toDomainArray(data);
  }

  protected async performFindUnique(id: string): Promise<Permission | null> {
    const result = await this.prisma.permission.findUnique({
      where: { id },
    });

    return this.mapToDomain(result);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    // Permissions don't support soft delete, use hard delete
    await this.performHardDelete(id);
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.permission.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    const { where } = options;

    return await this.prisma.permission.count({
      where,
    });
  }

  // Permission-specific methods

  async findByResource(
    resource: ResourceType,
    userId: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<Permission[]> {
    const where = {
      resource,
    };

    const result = await this.findAll(userId, pagination, { where });
    return result.data;
  }

  async findByAction(
    action: ActionType,
    userId: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<Permission[]> {
    const where = {
      action,
    };

    const result = await this.findAll(userId, pagination, { where });
    return result.data;
  }

  async findByResourceAndAction(
    resource: ResourceType,
    action: ActionType,
    userId: string,
  ): Promise<Permission | null> {
    const permission = await this.prisma.permission.findFirst({
      where: {
        resource,
        action,
      },
    });

    return this.mapToDomain(permission);
  }

  async createResourcePermissions(
    resource: ResourceType,
    actions: ActionType[],
    userId: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = [];
    
    for (const action of actions) {
      // Check if permission already exists
      const existing = await this.findByResourceAndAction(resource, action, userId);
      if (!existing) {
        const createInput: CreatePermissionInput = {
          resource,
          action,
          description: `${action} permission for ${resource}`,
        };
        const permission = await this.create(createInput, userId);
        permissions.push(permission);
      } else {
        permissions.push(existing);
      }
    }

    return permissions;
  }

  async getAllResourcePermissions(
    userId: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<{ [key: string]: Permission[] }> {
    const result = await this.findAll(userId, pagination);
    const permissions = result.data;

    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      const resource = permission.resource;
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(permission);
    });

    return grouped;
  }

  async getPermissionsByUser(
    userId: string,
    targetUserId: string,
  ): Promise<Permission[]> {
    // This would typically involve joining with user roles and role permissions
    // For now, returning empty array - would need to implement user-role-permission logic
    return [];
  }

  async validatePermissionExists(
    resource: ResourceType,
    action: ActionType,
  ): Promise<boolean> {
    const permission = await this.prisma.permission.findFirst({
      where: {
        resource,
        action,
      },
    });

    return !!permission;
  }
}
