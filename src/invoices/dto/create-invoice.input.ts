import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateInvoiceItemInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  quantity: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unitPrice: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  unit?: string;
}

@InputType()
export class CreateInvoiceInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @Field(() => String, { defaultValue: 'DRAFT' })
  @IsEnum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @Field(() => String)
  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @Field(() => String)
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  terms?: string;

  @Field(() => Float, { defaultValue: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @Field(() => String, { defaultValue: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  exchangeRate?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  paymentReference?: string;

  @Field(() => [CreateInvoiceItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemInput)
  @IsNotEmpty()
  items: CreateInvoiceItemInput[];

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  projectId?: string;
}
