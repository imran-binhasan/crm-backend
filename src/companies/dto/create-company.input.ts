import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
} from 'class-validator';

@InputType()
export class CreateCompanyInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  size?: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
