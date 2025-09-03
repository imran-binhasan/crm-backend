import { Injectable, ConflictException } from '@nestjs/common';
import { Employee as PrismaEmployee } from '@prisma/client';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { ResourceType } from '../common/rbac/permission.types';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { Employee } from './entities/employee.entity';
import { EmployeeMapper } from './mappers/employee.mapper';

@Injectable()
export class EmployeesService extends BaseService<
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput
> {
  protected readonly resourceType = ResourceType.EMPLOYEE;

  constructor(
    prisma: PrismaService,
    rbacService: RbacService,
  ) {
    super(prisma, rbacService, EmployeesService.name);
  }

  protected mapToDomain(prismaEntity: any): Employee {
    return EmployeeMapper.toDomain(prismaEntity);
  }

  protected async performCreate(data: CreateEmployeeInput, currentUserId: string): Promise<Employee> {
    // Generate unique employee ID
    const employeeId = `EMP-${Date.now()}`;
    
    // Check for email conflicts if provided
    if (data.email) {
      const existingEmployee = await this.prisma.employee.findFirst({
        where: { email: data.email, deletedAt: null },
      });
      if (existingEmployee) {
        throw new ConflictException('Employee with this email already exists');
      }
    }

    const employeeData = {
      ...data,
      employeeId,
      createdById: currentUserId,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      hireDate: new Date(data.hireDate),
      terminationDate: data.terminationDate ? new Date(data.terminationDate) : null,
      employmentType: data.employmentType || 'FULL_TIME',
      status: data.status || 'ACTIVE',
      weeklyHours: data.weeklyHours || 40,
    };

    const result = await this.prisma.employee.create({
      data: employeeData as any,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  protected async performFindMany(options: any): Promise<Employee[]> {
    const result = await this.prisma.employee.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });

    return result.map(employee => this.mapToDomain(employee));
  }

  protected async performFindUnique(id: string): Promise<Employee | null> {
    const result = await this.prisma.employee.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeOptions(),
    });

    return result ? this.mapToDomain(result) : null;
  }

  protected async performUpdate(id: string, data: UpdateEmployeeInput, currentUserId: string): Promise<Employee> {
    const { id: _, ...updateData } = data;
    
    // Check for email conflicts if email is being updated
    if (updateData.email) {
      const existingEmployee = await this.prisma.employee.findFirst({
        where: { 
          email: updateData.email, 
          deletedAt: null,
          NOT: { id },
        },
      });
      if (existingEmployee) {
        throw new ConflictException('Employee with this email already exists');
      }
    }

    const processedData: any = {
      ...updateData,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : updateData.dateOfBirth,
      hireDate: data.hireDate ? new Date(data.hireDate) : updateData.hireDate,
      terminationDate: data.terminationDate ? new Date(data.terminationDate) : updateData.terminationDate,
    };

    const result = await this.prisma.employee.update({
      where: { id },
      data: processedData,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    await this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.employee.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.employee.count(options);
  }

  private getIncludeOptions() {
    return {
      manager: {
        select: { 
          id: true, 
          employeeId: true,
          firstName: true, 
          lastName: true,
          email: true,
          department: true,
          position: true,
        },
      },
      directReports: {
        select: { 
          id: true, 
          employeeId: true,
          firstName: true, 
          lastName: true,
          email: true,
          department: true,
          position: true,
        },
      },
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    };
  }

  // Business-specific methods
  async findByDepartment(department: string, currentUserId: string): Promise<Employee[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaEmployees = await this.prisma.employee.findMany({
      where: {
        ...filters,
        department,
        deletedAt: null,
      },
      include: this.getIncludeOptions(),
      orderBy: { lastName: 'asc' },
    });

    return prismaEmployees.map(employee => this.mapToDomain(employee));
  }

  async findByManager(managerId: string, currentUserId: string): Promise<Employee[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaEmployees = await this.prisma.employee.findMany({
      where: {
        ...filters,
        managerId,
        deletedAt: null,
      },
      include: this.getIncludeOptions(),
      orderBy: { lastName: 'asc' },
    });

    return prismaEmployees.map(employee => this.mapToDomain(employee));
  }

  async getEmployeeHierarchy(employeeId: string, currentUserId: string): Promise<Employee[]> {
    const employee = await this.findOne(employeeId, currentUserId);
    const hierarchy = [employee];

    let current = employee;
    while (current.managerId) {
      const manager = await this.findOne(current.managerId, currentUserId);
      hierarchy.unshift(manager);
      current = manager;
    }

    return hierarchy;
  }

  async assignManager(employeeId: string, managerId: string, currentUserId: string): Promise<Employee> {
    // Prevent circular management relationships
    const manager = await this.findOne(managerId, currentUserId);
    if (manager.managerId === employeeId) {
      throw new ConflictException('Cannot assign employee as manager to their own manager');
    }

    const result = await this.prisma.employee.update({
      where: { id: employeeId },
      data: { managerId },
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  async updateEmploymentStatus(employeeId: string, status: string, currentUserId: string): Promise<Employee> {
    const updateData: any = { status };
    
    // Set termination date if status is TERMINATED
    if (status === 'TERMINATED') {
      updateData.terminationDate = new Date();
    }

    const result = await this.prisma.employee.update({
      where: { id: employeeId },
      data: updateData,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  async findActiveEmployees(currentUserId: string): Promise<Employee[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaEmployees = await this.prisma.employee.findMany({
      where: {
        ...filters,
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: this.getIncludeOptions(),
      orderBy: { lastName: 'asc' },
    });

    return prismaEmployees.map(employee => this.mapToDomain(employee));
  }
}
