import { CreateActivityInput } from './create-activity.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateActivityInput extends PartialType(CreateActivityInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
