import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesResolver } from './activities.resolver';
import { ActivityMapper } from './mappers/activity.mapper';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [ActivitiesService, ActivitiesResolver, ActivityMapper],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
