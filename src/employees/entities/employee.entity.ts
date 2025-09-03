import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Decimal } from '@prisma/client/runtime/library';

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
  email?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  personalEmail?: string | null;

  @Field(() => Date, { nullable: true })
  dateOfBirth?: Date | null;

  @Field(() => String, { nullable: true })
  gender?: string | null;

  @Field(() => String, { nullable: true })
  maritalStatus?: string | null;

  @Field(() => String, { nullable: true })
  address?: string | null;

  @Field(() => String, { nullable: true })
  emergencyContact?: string | null;

  @Field(() => String, { nullable: true })
  emergencyPhone?: string | null;

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
  terminationDate?: Date | null;

  @Field(() => Float, { nullable: true })
  salary?: Decimal | null;

  @Field(() => String, { nullable: true })
  salaryType?: string | null; // HOURLY, MONTHLY, YEARLY

  @Field(() => String, { nullable: true })
  workLocation?: string | null; // OFFICE, REMOTE, HYBRID

  @Field(() => Number, { defaultValue: 40 })
  weeklyHours: number;

  // Relations
  @Field(() => String, { nullable: true })
  managerId?: string | null;

  @Field(() => Employee, { nullable: true })
  manager?: Employee | null;

  @Field(() => [Employee], { nullable: true })
  directReports?: Employee[] | null;

  @Field(() => String, { nullable: true })
  userId?: string | null;

  @Field(() => User, { nullable: true })
  user?: User | null;

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
  deletedAt?: Date | null;
}
