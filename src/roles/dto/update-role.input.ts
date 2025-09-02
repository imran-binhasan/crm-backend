import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { CreateRoleInput } from './create-role.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateRoleInput extends PartialType(CreateRoleInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
