import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Attendance {
  @Field(() => ID)
  id: string;

  @Field(() => Date)
  date: Date;

  @Field(() => Date, { nullable: true })
  checkIn?: Date;

  @Field(() => Date, { nullable: true })
  checkOut?: Date;

  @Field(() => Float, { nullable: true })
  hoursWorked?: number;

  @Field(() => Float, { nullable: true })
  breakTime?: number; // in minutes

  @Field(() => String)
  status: string; // PRESENT, ABSENT, LATE, HALF_DAY, WORK_FROM_HOME

  @Field(() => String, { nullable: true })
  workLocation?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  reasonForAbsence?: string;

  @Field(() => Boolean, { defaultValue: false })
  isOvertime: boolean;

  @Field(() => Float, { nullable: true })
  overtimeHours?: number;

  @Field(() => Boolean, { defaultValue: false })
  isHoliday: boolean;

  @Field(() => Boolean, { defaultValue: false })
  isWeekend: boolean;

  // Geo-location (optional for location-based attendance)
  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field(() => String, { nullable: true })
  ipAddress?: string;

  // Relations
  @Field(() => String)
  employeeId: string;

  @Field(() => Employee)
  employee: Employee;

  // Approval workflow
  @Field(() => String, { nullable: true })
  approvedById?: string;

  @Field(() => User, { nullable: true })
  approvedBy?: User;

  @Field(() => Date, { nullable: true })
  approvedAt?: Date;

  @Field(() => String, { defaultValue: 'PENDING' })
  approvalStatus: string; // PENDING, APPROVED, REJECTED

  // System fields
  @Field(() => String, { nullable: true })
  createdById?: string;

  @Field(() => User, { nullable: true })
  createdBy?: User;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}
