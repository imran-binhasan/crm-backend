import { registerEnumType } from '@nestjs/graphql';

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED',
  ON_LEAVE = 'ON_LEAVE',
}

export enum SalaryType {
  HOURLY = 'HOURLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum WorkLocation {
  OFFICE = 'OFFICE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

// Register enums with GraphQL
registerEnumType(EmploymentType, {
  name: 'EmploymentType',
  description: 'The employment type of an employee',
});

registerEnumType(EmployeeStatus, {
  name: 'EmployeeStatus',
  description: 'The current status of an employee',
});

registerEnumType(SalaryType, {
  name: 'SalaryType',
  description: 'The salary payment type',
});

registerEnumType(WorkLocation, {
  name: 'WorkLocation',
  description: 'The work location type',
});

registerEnumType(Gender, {
  name: 'Gender',
  description: 'Gender options',
});

registerEnumType(MaritalStatus, {
  name: 'MaritalStatus',
  description: 'Marital status options',
});
