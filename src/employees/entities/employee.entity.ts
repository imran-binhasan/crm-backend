import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Decimal } from '@prisma/client/runtime/library';
import { AuditableEntity } from '../../common/entities/base.entity';
import {
  EmploymentType,
  EmployeeStatus,
  SalaryType,
  WorkLocation,
  Gender,
  MaritalStatus,
} from '../dto/employee.enums';

@ObjectType()
export class Employee extends AuditableEntity {
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

  @Field(() => Gender, { nullable: true })
  gender?: Gender | null;

  @Field(() => MaritalStatus, { nullable: true })
  maritalStatus?: MaritalStatus | null;

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

  @Field(() => EmploymentType)
  employmentType: EmploymentType;

  @Field(() => EmployeeStatus)
  status: EmployeeStatus;

  @Field(() => Date)
  hireDate: Date;

  @Field(() => Date, { nullable: true })
  terminationDate?: Date | null;

  @Field(() => Float, { nullable: true })
  salary?: Decimal | null;

  @Field(() => SalaryType, { nullable: true })
  salaryType?: SalaryType | null;

  @Field(() => WorkLocation, { nullable: true })
  workLocation?: WorkLocation | null;

  @Field(() => Int, { defaultValue: 40 })
  weeklyHours: number;

  // Relations
  @Field(() => ID, { nullable: true })
  managerId?: string | null;

  @Field(() => Employee, { nullable: true })
  manager?: Employee | null;

  @Field(() => [Employee], { nullable: true })
  directReports?: Employee[] | null;

  @Field(() => ID, { nullable: true })
  userId?: string | null;

  @Field(() => User, { nullable: true })
  user?: User | null;

  @Field(() => User)
  createdBy: User;
}
