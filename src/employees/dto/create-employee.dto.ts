import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEmail, IsOptional, IsDateString, IsEnum } from 'class-validator';

@InputType()
export class CreateEmployeeDto {
  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field()
  @IsDateString()
  dateOfBirth: string;

  @Field()
  @IsString()
  department: string;

  @Field()
  @IsString()
  position: string;

  @Field()
  @IsDateString()
  hireDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  employmentStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  managerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;
}
