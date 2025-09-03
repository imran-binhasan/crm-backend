import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesResolver } from './invoices.resolver';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [InvoicesService, InvoicesResolver],
  exports: [InvoicesService],
})
export class InvoicesModule {}
