import { CreateInvoiceInput } from './create-invoice.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateInvoiceInput extends PartialType(CreateInvoiceInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
