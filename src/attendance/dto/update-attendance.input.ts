import { CreateAttendanceInput } from './create-attendance.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateAttendanceInput extends PartialType(CreateAttendanceInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
