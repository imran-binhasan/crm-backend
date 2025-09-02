import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsEmail, IsOptional, IsBoolean, IsUUID } from 'class-validator';

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
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  source?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
