import { InputType, Field, Float } from '@nestjs/graphql';
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

  @Field(() => String)
  @IsEnum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'WORK_FROM_HOME'])
  @IsNotEmpty()
  status: string;

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

  @Field(() => String, { defaultValue: 'PENDING' })
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  @IsOptional()
  approvalStatus?: string;
}
