import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

@InputType()
export class CreateAttendanceDto {
  @Field()
  @IsString()
  employeeId: string;

  @Field()
  @IsDateString()
  checkInTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  checkInLatitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  checkInLongitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
