import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RbacService } from '../rbac/rbac.service';
import { ResourceType, ActionType } from '../rbac/permission.types';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      return false;
    }

    // Parse permissions and check each one
    for (const permission of requiredPermissions) {
      const [resource, action, condition] = permission.split(':');
      
      const permissionCheck = {
        resource: resource as ResourceType,
        action: action as ActionType,
        conditions: condition ? [{ field: 'ownership', operator: condition as any, value: user.id }] : undefined,
      };

      const hasPermission = await this.rbacService.hasPermission(
        user.id,
        permissionCheck,
        this.getResourceData(ctx)
      );

      if (hasPermission) {
        return true; // OR logic - any permission allows access
      }
    }

    return false;
  }

  private getResourceData(ctx: GqlExecutionContext): any {
    const args = ctx.getArgs();
    // Extract resource data from GraphQL arguments
    return args.id ? { id: args.id } : args;
  }
}
