import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsResolver } from './contacts.resolver';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [ContactsService, ContactsResolver],
  exports: [ContactsService],
})
export class ContactsModule {}
