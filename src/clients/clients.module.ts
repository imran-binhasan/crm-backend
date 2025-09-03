import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsResolver } from './clients.resolver';
import { ClientMapper } from './mappers/client.mapper';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [ClientsResolver, ClientsService, ClientMapper],
  exports: [ClientsService],
})
export class ClientsModule {}
