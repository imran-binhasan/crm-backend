import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Permission, PermissionCheck, PermissionCondition, ResourceType, ActionType } from './permission.types';

type UserWithRole = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
    permissions: {
      permission: {
        id: string;
        resource: string;
        action: string;
        description?: string;
      };
    }[];
  };
};

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);
  private readonly permissionCache = new Map<string, Permission[]>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if user has permission for a specific resource and action
   */
  async hasPermission(
    userId: string, 
    permissionCheck: PermissionCheck,
    resourceData?: any
  ): Promise<boolean> {
    const user = await this.getUserWithPermissions(userId);
    if (!user) return false;

    // Super admin check
    if (await this.isSuperAdmin(user)) return true;

    // Check specific permission
    const hasPermission = await this.checkUserPermission(user, permissionCheck);
    if (!hasPermission) return false;

    // Apply conditional checks
    if (permissionCheck.conditions && resourceData) {
      return this.evaluateConditions(permissionCheck.conditions, resourceData, user);
    }

    return true;
  }

  /**
   * Check multiple permissions (OR logic)
   */
  async hasAnyPermission(userId: string, permissions: PermissionCheck[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check multiple permissions (AND logic)
   */
  async hasAllPermissions(userId: string, permissions: PermissionCheck[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get user permissions with caching
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.getUserWithPermissions(userId) as UserWithRole | null;
    if (!user || !user.role) return [];

    const permissions: Permission[] = [];
    
    for (const rolePermission of user.role.permissions) {
      const permission = rolePermission.permission;
      permissions.push(new Permission(
        permission.resource as ResourceType,
        permission.action as ActionType
      ));
    }

    return permissions;
  }

  /**
   * Filter resources based on user permissions
   */
  async filterByPermissions<T>(
    userId: string,
    resources: T[],
    resourceType: ResourceType,
    action: ActionType,
    getResourceId: (resource: T) => string
  ): Promise<T[]> {
    const user = await this.getUserWithPermissions(userId);
    if (!user) return [];

    if (await this.isSuperAdmin(user)) return resources;

    const filteredResources: T[] = [];

    for (const resource of resources) {
      const canAccess = await this.hasPermission(userId, {
        resource: resourceType,
        action,
      }, { id: getResourceId(resource) });

      if (canAccess) {
        filteredResources.push(resource);
      }
    }

    return filteredResources;
  }

  /**
   * Get filtered query conditions based on user permissions
   */
  async getPermissionFilters(userId: string, resource: ResourceType): Promise<any> {
    const user = await this.getUserWithPermissions(userId) as UserWithRole | null;
    if (!user) return { id: 'impossible' }; // Return impossible condition

    if (await this.isSuperAdmin(user)) return {}; // No restrictions

    // Check for ownership-based permissions
    const ownershipPermission = user.role.permissions.find(rp => 
      rp.permission.resource === resource && 
      rp.permission.description?.includes('own')
    );

    if (ownershipPermission) {
      return {
        OR: [
          { createdById: userId },
          { assignedToId: userId },
        ]
      };
    }

    // Check for team-based permissions
    const teamPermission = user.role.permissions.find(rp => 
      rp.permission.resource === resource && 
      rp.permission.description?.includes('team')
    );

    if (teamPermission) {
      // Get user's team members
      const teamMembers = await this.getTeamMembers(userId);
      return {
        OR: [
          { createdById: { in: teamMembers } },
          { assignedToId: { in: teamMembers } },
        ]
      };
    }

    return {};
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  /**
   * Get user with roles and permissions
   */
  private async getUserWithPermissions(userId: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId, isActive: true },
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
    } catch (error) {
      this.logger.error(`Failed to get user with permissions: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if user is super admin
   */
  private async isSuperAdmin(user: any): Promise<boolean> {
    return user.role.name === 'Super Admin' || user.role.name === 'System Admin';
  }

  /**
   * Check specific user permission
   */
  private async checkUserPermission(user: any, permissionCheck: PermissionCheck): Promise<boolean> {
    const userPermissions = user.role.permissions.map(rp => ({
      resource: rp.permission.resource,
      action: rp.permission.action,
    }));

    // Check for exact match
    const exactMatch = userPermissions.some(p => 
      p.resource === permissionCheck.resource && p.action === permissionCheck.action
    );

    if (exactMatch) return true;

    // Check for wildcard permissions (manage = all actions)
    const managePermission = userPermissions.some(p => 
      p.resource === permissionCheck.resource && p.action === 'manage'
    );

    return managePermission;
  }

  /**
   * Evaluate conditional permissions
   */
  private evaluateConditions(
    conditions: PermissionCondition[], 
    resourceData: any, 
    user: any
  ): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(resourceData, condition.field);
      
      switch (condition.operator) {
        case 'eq':
          return fieldValue === condition.value;
        case 'ne':
          return fieldValue !== condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        case 'nin':
          return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
        case 'own':
          return resourceData.createdById === user.id || resourceData.assignedToId === user.id;
        case 'team':
          // Implementation depends on your team structure
          return this.isTeamMember(user.id, fieldValue);
        case 'department':
          return user.department === fieldValue;
        default:
          return false;
      }
    });
  }

  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Check if user is team member (placeholder implementation)
   */
  private async isTeamMember(userId: string, targetValue: any): Promise<boolean> {
    // Implement based on your team structure
    return false;
  }

  /**
   * Get team members for user
   */
  private async getTeamMembers(userId: string): Promise<string[]> {
    // Implement based on your team structure
    // For now, return just the user
    return [userId];
  }
}
