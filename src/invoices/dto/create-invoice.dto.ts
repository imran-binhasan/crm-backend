import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsUUID,
  Length,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '../interfaces/invoice.interface';

// Register the enum for GraphQL
registerEnumType(InvoiceStatus, {
  name: 'InvoiceStatus',
  description: 'The status of an invoice',
});

@InputType()
export class CreateInvoiceItemDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @Field()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999.99)
  quantity: number;

  @Field()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999.99)
  unitPrice: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxRate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number;
}

@InputType()
export class CreateInvoiceDto {
  @Field()
  @IsUUID(4)
  @IsNotEmpty()
  clientId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID(4)
  projectId?: string;

  @Field()
  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @Field()
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @Field(() => InvoiceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  terms?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0.000001)
  exchangeRate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  paymentMethod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  paymentReference?: string;

  @Field(() => [CreateInvoiceItemDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
