import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => {
  const SetMetadata = require('@nestjs/common').SetMetadata;
  return SetMetadata(ROLES_KEY, roles);
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;
    
    return user && user.role && requiredRoles.includes(user.role.name);
  }
}
