import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail, IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateClientInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  code?: string;

  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  website?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  industry?: string;

  @Field(() => String)
  @IsEnum(['INDIVIDUAL', 'CORPORATE'])
  @IsNotEmpty()
  type: string;

  @Field(() => String, { defaultValue: 'ACTIVE' })
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  @IsOptional()
  status?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  taxId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  billingAddress?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => Int, { defaultValue: 30 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  paymentTerms?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  preferredCurrency?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  companyId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  primaryContactId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  accountManagerId?: string;
}
