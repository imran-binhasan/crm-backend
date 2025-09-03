import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
