import { CreateEmployeeInput } from './create-employee.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateEmployeeInput extends PartialType(CreateEmployeeInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
