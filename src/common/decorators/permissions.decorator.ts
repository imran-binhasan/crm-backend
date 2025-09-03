import { SetMetadata } from '@nestjs/common';
import {
  ResourceType,
  ActionType,
  PermissionCondition,
} from '../rbac/permission.types';

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSION_CONDITIONS_KEY = 'permission_conditions';

export interface PermissionDecoratorOptions {
  resource: ResourceType;
  action: ActionType;
  conditions?: PermissionCondition[];
  skipOwnershipCheck?: boolean;
}

// Basic permission decorator
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Advanced permission decorator with resource and action
export const RequirePermission = (options: PermissionDecoratorOptions) =>
  SetMetadata(PERMISSIONS_KEY, [`${options.resource}:${options.action}`]);

// Resource-based decorator
export const RequireResource = (resource: ResourceType, action: ActionType) =>
  SetMetadata(PERMISSIONS_KEY, [`${resource}:${action}`]);

// Multiple permissions (OR logic)
export const RequireAnyPermission = (
  ...permissions: PermissionDecoratorOptions[]
) =>
  SetMetadata(
    PERMISSIONS_KEY,
    permissions.map((p) => `${p.resource}:${p.action}`),
  );

// Multiple permissions (AND logic)
export const RequireAllPermissions = (
  ...permissions: PermissionDecoratorOptions[]
) =>
  SetMetadata(
    PERMISSIONS_KEY,
    permissions.map((p) => `${p.resource}:${p.action}`),
  );

// Ownership-based permission
export const RequireOwnership = (resource: ResourceType, action: ActionType) =>
  SetMetadata(PERMISSIONS_KEY, [`${resource}:${action}:own`]);

// Team-based permission
export const RequireTeamAccess = (resource: ResourceType, action: ActionType) =>
  SetMetadata(PERMISSIONS_KEY, [`${resource}:${action}:team`]);
