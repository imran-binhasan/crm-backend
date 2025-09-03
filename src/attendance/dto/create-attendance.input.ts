import { InputType, Field, Float, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
  IsBoolean,
} from 'class-validator';

// Register GraphQL Enums
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  WORK_FROM_HOME = 'WORK_FROM_HOME',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(AttendanceStatus, {
  name: 'AttendanceStatus',
  description: 'The attendance status of an employee',
});

registerEnumType(ApprovalStatus, {
  name: 'ApprovalStatus',
  description: 'The approval status of an attendance record',
});

@InputType()
export class CreateAttendanceInput {
  @Field(() => String)
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  checkIn?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  checkOut?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  hoursWorked?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  breakTime?: number;

  @Field(() => AttendanceStatus)
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workLocation?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  reasonForAbsence?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isOvertime?: boolean;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  overtimeHours?: number;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isHoliday?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isWeekend?: boolean;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  approvedById?: string;

  @Field(() => ApprovalStatus, { defaultValue: ApprovalStatus.PENDING })
  @IsEnum(ApprovalStatus)
  @IsOptional()
  approvalStatus?: ApprovalStatus;
}
