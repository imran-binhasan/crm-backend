import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Employee)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class EmployeesResolver {
  constructor(private readonly employeesService: EmployeesService) {}

  @Mutation(() => Employee)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.CREATE)
  async createEmployee(
    @Args('createEmployeeDto') createEmployeeDto: CreateEmployeeDto,
    @CurrentUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.create(createEmployeeDto, user.id);
  }

  @Query(() => [Employee], { name: 'employees' })
  @RequireResource(ResourceType.EMPLOYEE, ActionType.READ)
  async findAll(@CurrentUser() user: User): Promise<Employee[]> {
    return this.employeesService.findAll(user.id);
  }

  @Query(() => Employee, { name: 'employee' })
  @RequireResource(ResourceType.EMPLOYEE, ActionType.READ)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.findOne(id, user.id);
  }

  @Query(() => [Employee], { name: 'employeesByDepartment' })
  @RequireResource(ResourceType.EMPLOYEE, ActionType.READ)
  async findByDepartment(
    @Args('department') department: string,
    @CurrentUser() user: User,
  ): Promise<Employee[]> {
    return this.employeesService.findByDepartment(department, user.id);
  }

  @Query(() => [Employee], { name: 'employeesByManager' })
  @RequireResource(ResourceType.EMPLOYEE, ActionType.READ)
  async findByManager(
    @Args('managerId', { type: () => ID }) managerId: string,
    @CurrentUser() user: User,
  ): Promise<Employee[]> {
    return this.employeesService.findByManager(managerId, user.id);
  }

  @Query(() => [Employee], { name: 'employeeHierarchy' })
  @RequireResource(ResourceType.EMPLOYEE, ActionType.READ)
  async getHierarchy(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @CurrentUser() user: User,
  ): Promise<Employee[]> {
    return this.employeesService.getEmployeeHierarchy(employeeId, user.id);
  }

  @Mutation(() => Employee)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.UPDATE)
  async updateEmployee(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateEmployeeDto') updateEmployeeDto: UpdateEmployeeDto,
    @CurrentUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.update(id, updateEmployeeDto, user.id);
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.DELETE)
  async removeEmployee(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.employeesService.remove(id, user.id);
    return true;
  }

  @Mutation(() => Employee)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.UPDATE)
  async assignManager(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('managerId', { type: () => ID }) managerId: string,
    @CurrentUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.assignManager(employeeId, managerId, user.id);
  }

  @Mutation(() => Employee)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.UPDATE)
  async updateEmploymentStatus(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('status') status: string,
    @CurrentUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.updateEmploymentStatus(employeeId, status, user.id);
  }
}
