import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { CreateCompanyInput } from './create-company.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateCompanyInput extends PartialType(CreateCompanyInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
