import { CreateNoteInput } from './create-note.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateNoteInput extends PartialType(CreateNoteInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
