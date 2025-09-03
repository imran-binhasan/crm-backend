import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Employee {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  employeeId: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  personalEmail?: string;

  @Field(() => Date, { nullable: true })
  dateOfBirth?: Date;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => String, { nullable: true })
  maritalStatus?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  emergencyContact?: string;

  @Field(() => String, { nullable: true })
  emergencyPhone?: string;

  // Employment details
  @Field(() => String)
  department: string;

  @Field(() => String)
  position: string;

  @Field(() => String)
  employmentType: string; // FULL_TIME, PART_TIME, CONTRACT, INTERN

  @Field(() => String)
  status: string; // ACTIVE, INACTIVE, TERMINATED, ON_LEAVE

  @Field(() => Date)
  hireDate: Date;

  @Field(() => Date, { nullable: true })
  terminationDate?: Date;

  @Field(() => Float, { nullable: true })
  salary?: number;

  @Field(() => String, { nullable: true })
  salaryType?: string; // HOURLY, MONTHLY, YEARLY

  @Field(() => String, { nullable: true })
  workLocation?: string; // OFFICE, REMOTE, HYBRID

  @Field(() => Number, { defaultValue: 40 })
  weeklyHours: number;

  // Relations
  @Field(() => String, { nullable: true })
  managerId?: string;

  @Field(() => Employee, { nullable: true })
  manager?: Employee;

  @Field(() => [Employee])
  directReports: Employee[];

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => User, { nullable: true })
  user?: User;

  // System fields
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
