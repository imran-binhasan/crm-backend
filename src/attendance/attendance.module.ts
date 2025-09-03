import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
