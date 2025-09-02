import { Global, Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { PermissionGuard } from '../guards/permission.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [RbacService, PermissionGuard, RolesGuard],
  exports: [RbacService, PermissionGuard, RolesGuard],
})
export class RbacModule {}
