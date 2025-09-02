import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { CreateLeadInput } from './create-lead.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateLeadInput extends PartialType(CreateLeadInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
