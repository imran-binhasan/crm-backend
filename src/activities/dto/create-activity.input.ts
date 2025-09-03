import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { Priority } from '../../common/enums/priority.enum';

// Define GraphQL enum types
export enum ActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  TASK = 'TASK',
  NOTE = 'NOTE',
  DEMO = 'DEMO',
  FOLLOW_UP = 'FOLLOW_UP',
}

export enum ActivityStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Register enums with GraphQL
registerEnumType(ActivityType, {
  name: 'ActivityType',
  description: 'Activity type values',
});

registerEnumType(ActivityStatus, {
  name: 'ActivityStatus',
  description: 'Activity status values',
});

@InputType()
export class CreateActivityInput {
  @Field(() => ActivityType)
  @IsEnum(ActivityType)
  @IsNotEmpty()
  type: ActivityType;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  subject: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  scheduledAt?: Date;

  @Field(() => ActivityStatus, { defaultValue: ActivityStatus.SCHEDULED })
  @IsEnum(ActivityStatus)
  @IsNotEmpty()
  status: ActivityStatus;

  @Field(() => Priority, { defaultValue: Priority.MEDIUM })
  @IsEnum(Priority)
  @IsNotEmpty()
  priority: Priority;

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

  @Field(() => Date, { nullable: true })
  @IsOptional()
  followUpDate?: Date;

  // Related entities
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  dealId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
