import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsDateString,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType, ReportFormat } from '../entities/report.entity';

@InputType()
export class CreateReportFilterInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  field: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  operator: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  value: string;
}

@InputType()
export class CreateReportInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ReportType)
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @Field(() => ReportFormat, { defaultValue: ReportFormat.PDF })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @Field(() => [CreateReportFilterInput], { defaultValue: [] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReportFilterInput)
  @IsOptional()
  filters?: CreateReportFilterInput[];

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  columns?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  query?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isScheduled?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  schedulePattern?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  emailOnCompletion?: boolean;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  emailRecipients?: string[];
}
