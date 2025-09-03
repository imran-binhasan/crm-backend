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

export class CreateInvoiceItemDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999.99)
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999.99)
  unitPrice: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number;
}

export class CreateInvoiceDto {
  @IsUUID(4)
  @IsNotEmpty()
  clientId: string;

  @IsOptional()
  @IsUUID(4)
  projectId?: string;

  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  terms?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0.000001)
  exchangeRate?: number;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  paymentReference?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
