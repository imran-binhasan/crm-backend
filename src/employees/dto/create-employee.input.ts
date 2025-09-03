import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail, IsEnum, IsNotEmpty, IsNumber, Min, IsDateString } from 'class-validator';

@InputType()
export class CreateEmployeeInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  employeeId: string;

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

  @Field(() => String, { nullable: true })
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  @IsOptional()
  gender?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'])
  @IsOptional()
  maritalStatus?: string;

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

  @Field(() => String)
  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'])
  @IsNotEmpty()
  employmentType: string;

  @Field(() => String, { defaultValue: 'ACTIVE' })
  @IsEnum(['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE'])
  @IsOptional()
  status?: string;

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

  @Field(() => String, { nullable: true })
  @IsEnum(['HOURLY', 'MONTHLY', 'YEARLY'])
  @IsOptional()
  salaryType?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(['OFFICE', 'REMOTE', 'HYBRID'])
  @IsOptional()
  workLocation?: string;

  @Field(() => Int, { defaultValue: 40 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  weeklyHours?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  managerId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;
}
