import { CreateReportInput } from './create-report.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateReportInput extends PartialType(CreateReportInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
