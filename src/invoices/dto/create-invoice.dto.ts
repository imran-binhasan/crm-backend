import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
class InvoiceItemDto {
  @Field()
  @IsString()
  description: string;

  @Field()
  @IsNumber()
  quantity: number;

  @Field()
  @IsNumber()
  unitPrice: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  taxRate?: number;
}

@InputType()
export class CreateInvoiceDto {
  @Field()
  @IsString()
  clientId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  projectId?: string;

  @Field()
  @IsString()
  invoiceNumber: string;

  @Field()
  @IsDateString()
  issueDate: string;

  @Field()
  @IsDateString()
  dueDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  terms?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [InvoiceItemDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
