import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import {
  EmploymentType,
  EmployeeStatus,
  SalaryType,
  WorkLocation,
  Gender,
  MaritalStatus,
} from './employee.enums';

@InputType()
export class CreateEmployeeInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  personalEmail?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @Field(() => Gender, { nullable: true })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @Field(() => MaritalStatus, { nullable: true })
  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  department: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  position: string;

  @Field(() => EmploymentType, { defaultValue: EmploymentType.FULL_TIME })
  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @Field(() => EmployeeStatus, { defaultValue: EmployeeStatus.ACTIVE })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @Field(() => String)
  @IsDateString()
  @IsNotEmpty()
  hireDate: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  terminationDate?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salary?: number;

  @Field(() => SalaryType, { nullable: true })
  @IsEnum(SalaryType)
  @IsOptional()
  salaryType?: SalaryType;

  @Field(() => WorkLocation, { nullable: true })
  @IsEnum(WorkLocation)
  @IsOptional()
  workLocation?: WorkLocation;

  @Field(() => Int, { defaultValue: 40 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  weeklyHours?: number;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  managerId?: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;
}
