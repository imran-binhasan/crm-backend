import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
