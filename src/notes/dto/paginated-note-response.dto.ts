import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { Note } from '../entities/note.entity';

@ObjectType()
export class PaginatedNoteResponse extends PaginatedResponse<Note> {
  @Field(() => [Note])
  items: Note[];
}
