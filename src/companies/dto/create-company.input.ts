import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsEnum,
} from 'class-validator';

// Define GraphQL enum types
export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROSPECT = 'PROSPECT',
  CLIENT = 'CLIENT',
  FORMER_CLIENT = 'FORMER_CLIENT',
}

export enum CompanySize {
  STARTUP = 'STARTUP',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE',
}

// Register enums with GraphQL
registerEnumType(CompanyStatus, {
  name: 'CompanyStatus',
  description: 'Company status values',
});

registerEnumType(CompanySize, {
  name: 'CompanySize',
  description: 'Company size values',
});

@InputType()
export class CreateCompanyInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field(() => CompanySize, { nullable: true })
  @IsOptional()
  @IsEnum(CompanySize)
  size?: CompanySize;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  revenue?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  // Address fields
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  street?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  // Social media
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @Field(() => CompanyStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
