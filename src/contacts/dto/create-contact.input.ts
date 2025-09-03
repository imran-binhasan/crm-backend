import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEnum,
} from 'class-validator';

// Define GraphQL enum types
export enum ContactStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  QUALIFIED = 'QUALIFIED',
  UNQUALIFIED = 'UNQUALIFIED',
  CONVERTED = 'CONVERTED',
}

export enum ContactSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  COLD_CALL = 'cold_call',
  EMAIL_CAMPAIGN = 'email_campaign',
  SOCIAL_MEDIA = 'social_media',
  TRADE_SHOW = 'trade_show',
  PARTNER = 'partner',
  OTHER = 'other',
}

// Register enums with GraphQL
registerEnumType(ContactStatus, {
  name: 'ContactStatus',
  description: 'Contact status values',
});

registerEnumType(ContactSource, {
  name: 'ContactSource',
  description: 'Contact source values',
});

@InputType()
export class CreateContactInput {
  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mobile?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  companyId?: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  // Status and source
  @Field(() => ContactStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @Field(() => ContactSource, { nullable: true })
  @IsOptional()
  @IsEnum(ContactSource)
  source?: ContactSource;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
