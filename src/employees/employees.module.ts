import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesResolver } from './employees.resolver';
import { EmployeeMapper } from './mappers/employee.mapper';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [EmployeesService, EmployeesResolver, EmployeeMapper],
  exports: [EmployeesService],
})
export class EmployeesModule {}
