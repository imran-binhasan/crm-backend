import { Injectable } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { PermissionMapper } from '../../permissions/mappers/permission.mapper';

@Injectable()
export class RoleMapper {
  static toDomain(prismaRole: any): Role | null {
    if (!prismaRole) return null;

    const role = new Role();
    role.id = prismaRole.id;
    role.name = prismaRole.name;
    role.description = prismaRole.description || null;
    role.isActive = prismaRole.isActive ?? true;
    role.createdAt = prismaRole.createdAt;
    role.updatedAt = prismaRole.updatedAt;
    role.deletedAt = prismaRole.deletedAt || null;

    // Handle relations
    if (prismaRole.users) {
      role.users = prismaRole.users;
      role.userCount = prismaRole.users.length;
    }

    if (prismaRole.permissions) {
      // Handle RolePermission junction table
      if (Array.isArray(prismaRole.permissions) && prismaRole.permissions.length > 0) {
        // Check if it's the junction table format
        if (prismaRole.permissions[0].permission) {
          role.permissions = prismaRole.permissions
            .map((rp: any) => PermissionMapper.toDomain(rp.permission))
            .filter(Boolean);
        } else {
          role.permissions = prismaRole.permissions
            .map((p: any) => PermissionMapper.toDomain(p))
            .filter(Boolean);
        }
        role.permissionCount = role.permissions?.length || 0;
      }
    }

    return role;
  }

  static toDomainArray(prismaRoles: any[]): Role[] {
    if (!prismaRoles || !Array.isArray(prismaRoles)) return [];
    return prismaRoles.map(role => RoleMapper.toDomain(role)).filter(Boolean) as Role[];
  }
}
