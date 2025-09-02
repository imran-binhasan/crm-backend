import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
