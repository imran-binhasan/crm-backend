import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { BaseService } from '../common/services/base.service';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { Role } from './entities/role.entity';
import { RoleMapper } from './mappers/role.mapper';
import { ResourceType } from '../common/rbac/permission.types';

@Injectable()
export class RolesService extends BaseService<Role, CreateRoleInput, UpdateRoleInput> {
  protected readonly resourceType = ResourceType.ROLE;

  constructor(
    prisma: PrismaService,
    rbacService: RbacService,
  ) {
    super(prisma, rbacService, RolesService.name);
  }

  protected mapToDomain(prismaEntity: any): Role | null {
    return RoleMapper.toDomain(prismaEntity);
  }

  protected async performCreate(data: CreateRoleInput, currentUserId: string): Promise<Role> {
    // Check if role name already exists
    const existingRole = await this.prisma.role.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const roleData = {
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.prisma.role.create({
      data: roleData,
      include: this.getIncludeRelations(),
    });

    // Handle permissions if provided
    if (data.permissionIds && data.permissionIds.length > 0) {
      await this.assignPermissions(created.id, data.permissionIds, currentUserId);
      
      // Refetch with permissions
      const roleWithPermissions = await this.prisma.role.findUnique({
        where: { id: created.id },
        include: this.getIncludeRelations(),
      });

      return this.mapToDomain(roleWithPermissions)!;
    }

    return this.mapToDomain(created)!;
  }

  protected async performUpdate(id: string, data: UpdateRoleInput, currentUserId: string): Promise<Role> {
    const updateData: any = {};

    if (data.name) {
      // Check if role name already exists (excluding current role)
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
      updateData.name = data.name;
    }

    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    updateData.updatedAt = new Date();

    const updated = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: this.getIncludeRelations(),
    });

    // Handle permissions if provided
    if (data.permissionIds) {
      await this.assignPermissions(id, data.permissionIds, currentUserId);
      
      // Refetch with updated permissions
      const roleWithPermissions = await this.prisma.role.findUnique({
        where: { id },
        include: this.getIncludeRelations(),
      });

      return this.mapToDomain(roleWithPermissions)!;
    }

    return this.mapToDomain(updated)!;
  }

  protected async performFindMany(options: any): Promise<Role[]> {
    const { where, orderBy, take, skip } = options;
    
    const whereClause = {
      ...where,
      deletedAt: null,
    };

    const data = await this.prisma.role.findMany({
      where: whereClause,
      orderBy: orderBy || { name: 'asc' },
      take,
      skip,
      include: this.getIncludeRelations(),
    });

    return RoleMapper.toDomainArray(data);
  }

  protected async performFindUnique(id: string): Promise<Role | null> {
    const result = await this.prisma.role.findUnique({
      where: { id },
      include: this.getIncludeRelations(),
    });

    return this.mapToDomain(result);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    await this.prisma.role.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    // Remove all role-permission relationships first
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    await this.prisma.role.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    const { where } = options;
    
    const whereClause = {
      ...where,
      deletedAt: null,
    };

    return await this.prisma.role.count({
      where: whereClause,
    });
  }

  // Role-specific methods

  async findByName(
    name: string,
    userId: string,
  ): Promise<Role | null> {
    const role = await this.prisma.role.findFirst({
      where: {
        name,
        deletedAt: null,
      },
      include: this.getIncludeRelations(),
    });

    return this.mapToDomain(role);
  }

  async findActiveRoles(
    userId: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<Role[]> {
    const where = {
      isActive: true,
      deletedAt: null,
    };

    const result = await this.findAll(userId, pagination, { where });
    return result.data;
  }

  async assignPermissions(
    roleId: string,
    permissionIds: string[],
    userId: string,
  ): Promise<void> {
    // First, remove existing permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Add new permissions
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        roleId,
        permissionId,
      }));

      await this.prisma.rolePermission.createMany({
        data: rolePermissions,
      });
    }
  }

  async removePermission(
    roleId: string,
    permissionId: string,
    userId: string,
  ): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  async getRolePermissions(
    roleId: string,
    userId: string,
  ): Promise<any[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    return rolePermissions.map(rp => rp.permission);
  }

  async assignUsersToRole(
    roleId: string,
    userIds: string[],
    userId: string,
  ): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        roleId,
        updatedAt: new Date(),
      },
    });
  }

  async removeUsersFromRole(
    roleId: string,
    userIds: string[],
    userId: string,
  ): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        id: { in: userIds },
        roleId,
      },
      data: {
        roleId: undefined,
        updatedAt: new Date(),
      },
    });
  }

  async getRoleUsers(
    roleId: string,
    userId: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<any[]> {
    const take = pagination?.limit;
    const skip = pagination && pagination.page && pagination.limit 
      ? (pagination.page - 1) * pagination.limit 
      : undefined;

    const users = await this.prisma.user.findMany({
      where: {
        roleId,
        deletedAt: null,
      },
      take,
      skip,
    });

    return users;
  }

  async toggleRoleStatus(
    roleId: string,
    userId: string,
  ): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const updated = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        isActive: !role.isActive,
        updatedAt: new Date(),
      },
      include: this.getIncludeRelations(),
    });

    return this.mapToDomain(updated)!;
  }

  async duplicateRole(
    roleId: string,
    newName: string,
    userId: string,
  ): Promise<Role> {
    const originalRole = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true,
      },
    });

    if (!originalRole) {
      throw new NotFoundException('Original role not found');
    }

    const createInput: CreateRoleInput = {
      name: newName,
      description: `Copy of ${originalRole.name}`,
      isActive: originalRole.isActive,
      permissionIds: originalRole.permissions.map(rp => rp.permissionId),
    };

    return await this.create(createInput, userId);
  }

  private getIncludeRelations() {
    return {
      users: {
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      permissions: {
        include: {
          permission: true,
        },
      },
    };
  }
}
