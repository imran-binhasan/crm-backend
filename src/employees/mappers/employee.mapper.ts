import { Injectable } from '@nestjs/common';
import { Employee } from '../entities/employee.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class EmployeeMapper {
  static toDomain(prismaEmployee: any): Employee {
    if (!prismaEmployee) throw new Error('Cannot map null employee to domain');

    const employee = new Employee();
    employee.id = prismaEmployee.id;
    employee.employeeId = prismaEmployee.employeeId;
    employee.firstName = prismaEmployee.firstName;
    employee.lastName = prismaEmployee.lastName;
    employee.email = prismaEmployee.email;
    employee.phone = prismaEmployee.phone;
    employee.personalEmail = prismaEmployee.personalEmail;
    employee.dateOfBirth = prismaEmployee.dateOfBirth;
    employee.gender = prismaEmployee.gender;
    employee.maritalStatus = prismaEmployee.maritalStatus;
    employee.address = prismaEmployee.address;
    employee.emergencyContact = prismaEmployee.emergencyContact;
    employee.emergencyPhone = prismaEmployee.emergencyPhone;
    employee.department = prismaEmployee.department;
    employee.position = prismaEmployee.position;
    employee.employmentType = prismaEmployee.employmentType;
    employee.status = prismaEmployee.status;
    employee.hireDate = prismaEmployee.hireDate;
    employee.terminationDate = prismaEmployee.terminationDate;
    employee.salary = prismaEmployee.salary;
    employee.salaryType = prismaEmployee.salaryType;
    employee.workLocation = prismaEmployee.workLocation;
    employee.weeklyHours = prismaEmployee.weeklyHours;
    employee.managerId = prismaEmployee.managerId;
    employee.userId = prismaEmployee.userId;
    employee.createdById = prismaEmployee.createdById;
    employee.createdAt = prismaEmployee.createdAt;
    employee.updatedAt = prismaEmployee.updatedAt;
    employee.deletedAt = prismaEmployee.deletedAt;

    // Map related entities
    if (prismaEmployee.manager) {
      const manager = new Employee();
      manager.id = prismaEmployee.manager.id;
      manager.employeeId = prismaEmployee.manager.employeeId;
      manager.firstName = prismaEmployee.manager.firstName;
      manager.lastName = prismaEmployee.manager.lastName;
      manager.email = prismaEmployee.manager.email;
      manager.department = prismaEmployee.manager.department;
      manager.position = prismaEmployee.manager.position;
      employee.manager = manager;
    }

    if (prismaEmployee.directReports) {
      employee.directReports = prismaEmployee.directReports.map((report: any) => {
        const directReport = new Employee();
        directReport.id = report.id;
        directReport.employeeId = report.employeeId;
        directReport.firstName = report.firstName;
        directReport.lastName = report.lastName;
        directReport.email = report.email;
        directReport.department = report.department;
        directReport.position = report.position;
        return directReport;
      });
    }

    if (prismaEmployee.user) {
      const user = new User();
      user.id = prismaEmployee.user.id;
      user.firstName = prismaEmployee.user.firstName;
      user.lastName = prismaEmployee.user.lastName;
      user.email = prismaEmployee.user.email;
      employee.user = user;
    }

    if (prismaEmployee.createdBy) {
      const createdBy = new User();
      createdBy.id = prismaEmployee.createdBy.id;
      createdBy.firstName = prismaEmployee.createdBy.firstName;
      createdBy.lastName = prismaEmployee.createdBy.lastName;
      createdBy.email = prismaEmployee.createdBy.email;
      employee.createdBy = createdBy;
    }

    return employee;
  }
}
