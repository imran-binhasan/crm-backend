import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
