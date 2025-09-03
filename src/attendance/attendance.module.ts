import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceMapper } from './mappers/attendance.mapper';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [AttendanceService, AttendanceResolver, AttendanceMapper],
  exports: [AttendanceService],
})
export class AttendanceModule {}
