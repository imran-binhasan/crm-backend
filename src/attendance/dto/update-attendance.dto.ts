import { CreateAttendanceDto } from './create-attendance.dto';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

@InputType()
export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  checkOutTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  checkOutLatitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  checkOutLongitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  overtimeHours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}
