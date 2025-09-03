import { InputType, Field, Float, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsArray,
  IsUUID,
} from 'class-validator';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ProjectType {
  FIXED_PRICE = 'FIXED_PRICE',
  TIME_AND_MATERIALS = 'TIME_AND_MATERIALS',
  RETAINER = 'RETAINER',
}

registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
  description: 'Project status',
});

registerEnumType(Priority, {
  name: 'Priority',
  description: 'Priority level',
});

registerEnumType(ProjectType, {
  name: 'ProjectType',
  description: 'Project type',
});

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

  @Field(() => ProjectStatus, { defaultValue: ProjectStatus.PLANNING })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @Field(() => Priority, { defaultValue: Priority.MEDIUM })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @Field(() => ProjectType, { nullable: true })
  @IsEnum(ProjectType)
  @IsOptional()
  type?: ProjectType;

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

  @Field(() => String, { nullable: true, defaultValue: 'USD' })
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
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  projectManagerId?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  teamMemberIds?: string[];
}
