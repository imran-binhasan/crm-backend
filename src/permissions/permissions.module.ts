import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsResolver } from './permissions.resolver';
import { PermissionMapper } from './mappers/permission.mapper';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [PermissionsService, PermissionsResolver, PermissionMapper],
  exports: [PermissionsService],
})
export class PermissionsModule {}
