import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { CreateContactInput } from './create-contact.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateContactInput extends PartialType(CreateContactInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
