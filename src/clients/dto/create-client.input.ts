import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';

export enum ClientType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

registerEnumType(ClientType, {
  name: 'ClientType',
  description: 'Client type classification',
});

registerEnumType(ClientStatus, {
  name: 'ClientStatus',
  description: 'Client status',
});

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

  @Field(() => ClientType)
  @IsEnum(ClientType)
  @IsNotEmpty()
  type: ClientType;

  @Field(() => ClientStatus, { defaultValue: ClientStatus.ACTIVE })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

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

  @Field(() => String, { nullable: true, defaultValue: 'USD' })
  @IsString()
  @IsOptional()
  preferredCurrency?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  primaryContactId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  accountManagerId?: string;
}
