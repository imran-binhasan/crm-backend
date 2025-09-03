import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class CreateActivityInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  type: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @Field(() => String)
  @IsEnum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsNotEmpty()
  status: string;

  @Field(() => String)
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  @IsNotEmpty()
  priority: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  outcome?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  followUpAction?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  followUpDate?: string;

  // Related entities
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  contactId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  companyId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  leadId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  dealId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  assignedToId?: string;
}
