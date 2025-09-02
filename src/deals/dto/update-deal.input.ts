import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { CreateDealInput } from './create-deal.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateDealInput extends PartialType(CreateDealInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
