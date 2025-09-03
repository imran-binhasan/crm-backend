import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesResolver } from './notes.resolver';
import { NoteMapper } from './mappers/note.mapper';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RbacModule } from '../common/rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  providers: [NotesService, NotesResolver, NoteMapper],
  exports: [NotesService],
})
export class NotesModule {}
