import { Module } from '@nestjs/common';
import { DealsService } from './deals.service';
import { DealsResolver } from './deals.resolver';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [DealsResolver, DealsService],
  exports: [DealsService],
})
export class DealsModule {}
