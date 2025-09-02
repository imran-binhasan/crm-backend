import { User, Role } from '@prisma/client';

export interface SafeUser extends Omit<User, 'password'> {
  role?: SafeRole;
}

export interface SafeRole extends Omit<Role, 'deletedAt'> {
  // Additional fields if needed
}

export interface UserWithRole extends User {
  role: Role;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  image?: string;
  roleId: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
  roleId?: string;
  isActive?: boolean;
}
