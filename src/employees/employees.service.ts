import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto, currentUserId: string) {
    return this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        employeeId: `EMP-${Date.now()}`, // Generate unique employee ID
        dateOfBirth: new Date(createEmployeeDto.dateOfBirth),
        hireDate: new Date(createEmployeeDto.hireDate),
        employmentType: 'FULL_TIME', // Default value
        status: 'ACTIVE', // Default value
        createdById: currentUserId,
      },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      }
    }) as any;
  }

  async findAll(currentUserId: string) {
    return this.prisma.employee.findMany({
      where: { deletedAt: null },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      }
    }) as any;
  }

  async findOne(id: string, currentUserId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id, deletedAt: null },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        directReports: { select: { id: true, firstName: true, lastName: true } },
      }
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee as any;
  }

  async findByDepartment(department: string, currentUserId: string) {
    return this.prisma.employee.findMany({
      where: { 
        department,
        deletedAt: null 
      },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      }
    }) as any;
  }

  async findByManager(managerId: string, currentUserId: string) {
    return this.prisma.employee.findMany({
      where: { 
        managerId,
        deletedAt: null 
      },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      }
    }) as any;
  }

  async getEmployeeHierarchy(employeeId: string, currentUserId: string) {
    // This would return the employee hierarchy (manager chain)
    const employee = await this.findOne(employeeId, currentUserId);
    const hierarchy = [employee];
    
    let current = employee;
    while (current.managerId) {
      const manager = await this.findOne(current.managerId, currentUserId);
      hierarchy.unshift(manager);
      current = manager;
    }
    
    return hierarchy as any;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, currentUserId: string) {
    const updateData: any = { ...updateEmployeeDto };
    
    if (updateEmployeeDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateEmployeeDto.dateOfBirth);
    }
    
    if (updateEmployeeDto.hireDate) {
      updateData.hireDate = new Date(updateEmployeeDto.hireDate);
    }

    return this.prisma.employee.update({
      where: { id, deletedAt: null },
      data: updateData,
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      }
    }) as any;
  }

  async remove(id: string, currentUserId: string) {
    return this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async assignManager(employeeId: string, managerId: string, currentUserId: string) {
    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { managerId },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      }
    }) as any;
  }

  async updateEmploymentStatus(employeeId: string, status: string, currentUserId: string) {
    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { status: status as any }, // Cast to handle enum type
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      }
    }) as any;
  }
}
