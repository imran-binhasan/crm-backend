export enum ResourceType {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  CONTACT = 'contact',
  COMPANY = 'company',
  LEAD = 'lead',
  DEAL = 'deal',
  ACTIVITY = 'activity',
  NOTE = 'note',
  CLIENT = 'client',
  PROJECT = 'project',
  EMPLOYEE = 'employee',
  ATTENDANCE = 'attendance',
  INVOICE = 'invoice',
  DASHBOARD = 'dashboard',
  REPORT = 'report',
}

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // All actions
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
  EXPORT = 'export',
  IMPORT = 'import',
  BULK_EDIT = 'bulk_edit',
  BULK_DELETE = 'bulk_delete',
}

export interface PermissionCheck {
  resource: ResourceType;
  action: ActionType;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'own' | 'team' | 'department';
  value: any;
}

export class Permission {
  constructor(
    public resource: ResourceType,
    public action: ActionType,
    public conditions?: PermissionCondition[],
  ) {}

  static create(
    resource: ResourceType,
    action: ActionType,
    conditions?: PermissionCondition[],
  ): Permission {
    return new Permission(resource, action, conditions);
  }

  toString(): string {
    const conditionStr = this.conditions?.length
      ? `:${this.conditions.map((c) => `${c.field}${c.operator}${c.value}`).join(',')}`
      : '';
    return `${this.resource}:${this.action}${conditionStr}`;
  }
}
