import { Injectable } from '@nestjs/common';
import { Permission } from '../entities/permission.entity';
import { ResourceType, ActionType } from '../../common/rbac/permission.types';

@Injectable()
export class PermissionMapper {
  static toDomain(prismaPermission: any): Permission | null {
    if (!prismaPermission) return null;

    const permission = new Permission();
    permission.id = prismaPermission.id;
    permission.resource = prismaPermission.resource as ResourceType;
    permission.action = prismaPermission.action as ActionType;
    permission.description = prismaPermission.description || null;
    permission.createdAt = prismaPermission.createdAt;
    permission.updatedAt = prismaPermission.updatedAt;
    permission.deletedAt = prismaPermission.deletedAt || null;

    return permission;
  }

  static toDomainArray(prismaPermissions: any[]): Permission[] {
    if (!prismaPermissions || !Array.isArray(prismaPermissions)) return [];
    return prismaPermissions.map(permission => PermissionMapper.toDomain(permission)).filter(Boolean) as Permission[];
  }
}
