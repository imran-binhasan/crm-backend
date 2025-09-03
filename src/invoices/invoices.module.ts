import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
