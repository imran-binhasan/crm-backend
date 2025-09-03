import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsNotEmpty, IsNumber, Min, Max, IsDateString, IsArray } from 'class-validator';

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  code?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { defaultValue: 'PLANNING' })
  @IsEnum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @Field(() => String, { defaultValue: 'MEDIUM' })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  @IsOptional()
  priority?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(['FIXED_PRICE', 'TIME_AND_MATERIALS', 'RETAINER'])
  @IsOptional()
  type?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualCost?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  actualStartDate?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  actualEndDate?: string;

  @Field(() => Number, { defaultValue: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  projectManagerId?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  teamMemberIds?: string[];
}
