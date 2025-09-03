import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

export enum ReportType {
  SALES = 'SALES',
  ATTENDANCE = 'ATTENDANCE',
  PROJECT = 'PROJECT',
  EMPLOYEE = 'EMPLOYEE',
  FINANCIAL = 'FINANCIAL',
  CLIENT = 'CLIENT',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(ReportType, { name: 'ReportType' });
registerEnumType(ReportFormat, { name: 'ReportFormat' });
registerEnumType(ReportStatus, { name: 'ReportStatus' });

@ObjectType()
export class ReportFilter {
  @Field(() => String)
  field: string;

  @Field(() => String)
  operator: string;

  @Field(() => String)
  value: string;
}

@ObjectType()
export class Report {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => ReportType)
  type: ReportType;

  @Field(() => ReportFormat)
  format: ReportFormat;

  @Field(() => ReportStatus)
  status: ReportStatus;

  @Field(() => Date, { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => [ReportFilter], { defaultValue: [] })
  filters: ReportFilter[];

  @Field(() => [String], { defaultValue: [] })
  columns: string[];

  @Field(() => String, { nullable: true })
  query?: string; // For custom reports

  @Field(() => String, { nullable: true })
  filePath?: string;

  @Field(() => String, { nullable: true })
  fileUrl?: string;

  @Field(() => Number, { nullable: true })
  fileSize?: number;

  @Field(() => Date, { nullable: true })
  generatedAt?: Date;

  @Field(() => String, { nullable: true })
  errorMessage?: string;

  @Field(() => Boolean, { defaultValue: false })
  isScheduled: boolean;

  @Field(() => String, { nullable: true })
  schedulePattern?: string; // Cron pattern

  @Field(() => Date, { nullable: true })
  nextRunAt?: Date;

  @Field(() => Date, { nullable: true })
  lastRunAt?: Date;

  @Field(() => Boolean, { defaultValue: false })
  emailOnCompletion: boolean;

  @Field(() => [String], { defaultValue: [] })
  emailRecipients: string[];

  // Relations
  @Field(() => String)
  createdById: string;

  @Field(() => User)
  createdBy: User;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}
