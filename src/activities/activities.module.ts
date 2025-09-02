import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
