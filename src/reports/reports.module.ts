import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
