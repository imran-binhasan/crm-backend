import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { CreatePermissionInput } from './create-permission.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdatePermissionInput extends PartialType(CreatePermissionInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
