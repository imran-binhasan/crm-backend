import { User } from '../entities/user.entity';
import { User as PrismaUser, Role } from '@prisma/client';

type PrismaUserWithRole = PrismaUser & {
  role?: Role;
};

export class UserMapper {
  static toDomain(prismaUser: PrismaUserWithRole): User {
    const domainUser = new User();
    
    domainUser.id = prismaUser.id;
    domainUser.firstName = prismaUser.firstName;
    domainUser.lastName = prismaUser.lastName;
    domainUser.email = prismaUser.email;
    domainUser.phone = prismaUser.phone || undefined;
    domainUser.image = prismaUser.image || undefined;
    domainUser.isActive = prismaUser.isActive;
    domainUser.roleId = prismaUser.roleId;
    domainUser.createdAt = prismaUser.createdAt;
    domainUser.updatedAt = prismaUser.updatedAt;
    domainUser.deletedAt = prismaUser.deletedAt || undefined;
    
    return domainUser;
  }

  static toDomainArray(prismaUsers: PrismaUserWithRole[]): User[] {
    return prismaUsers.map(this.toDomain);
  }
}
