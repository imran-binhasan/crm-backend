import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { PaginatedEmployeeResponse } from './dto/paginated-employee-response.dto';
import { PaginationInput } from '../common/dto/pagination.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { EmployeeStatus } from './dto/employee.enums';

@Resolver(() => Employee)
@UseGuards(JwtAuthGuard)
export class EmployeesResolver {
  constructor(private readonly employeesService: EmployeesService) {}

  @Query(() => PaginatedEmployeeResponse, { name: 'employees' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.READ)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) 
    pagination?: PaginationInput,
  ) {
    // Convert PaginationInput to PaginationOptions
    const paginationOptions = pagination ? {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder?.toLowerCase() as 'asc' | 'desc',
    } : undefined;

    const filterOptions = pagination?.search ? { search: pagination.search } : {};

    const result = await this.employeesService.findAll(currentUser.id, paginationOptions, filterOptions);
    return {
      items: result.data,
      pagination: result.meta,
    };
  }

  @Query(() => Employee, { name: 'employee' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.READ)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.findOne(id, user.id);
  }

  @Mutation(() => Employee)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.CREATE)
  async createEmployee(
    @Args('createEmployeeInput') createEmployeeInput: CreateEmployeeInput,
    @CurrentUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.create(createEmployeeInput, user.id);
  }

  @Mutation(() => Employee)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.UPDATE)
  async updateEmployee(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateEmployeeInput') updateEmployeeInput: UpdateEmployeeInput,
    @CurrentUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.update(id, updateEmployeeInput, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.DELETE)
  async removeEmployee(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.employeesService.remove(id, user.id);
    return true;
  }

  @Query(() => [Employee])
  async employeesByDepartment(
    @Args('department') department: string,
    @CurrentUser() user: User,
  ): Promise<Employee[]> {
    return this.employeesService.findByDepartment(department, user.id);
  }

  @Query(() => [Employee])
  async employeesByManager(
    @Args('managerId', { type: () => ID }) managerId: string,
    @CurrentUser() user: User,
  ): Promise<Employee[]> {
    return this.employeesService.findByManager(managerId, user.id);
  }

  @Query(() => [Employee])
  async employeeHierarchy(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @CurrentUser() user: User,
  ): Promise<Employee[]> {
    return this.employeesService.getEmployeeHierarchy(employeeId, user.id);
  }

  @Query(() => [Employee])
  async activeEmployees(
    @CurrentUser() user: User,
  ): Promise<Employee[]> {
    return this.employeesService.findActiveEmployees(user.id);
  }

  @Mutation(() => Employee)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.UPDATE)
  async assignManager(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('managerId', { type: () => ID }) managerId: string,
    @CurrentUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.assignManager(employeeId, managerId, user.id);
  }

  @Mutation(() => Employee)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.EMPLOYEE, ActionType.UPDATE)
  async updateEmploymentStatus(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('status', { type: () => EmployeeStatus }) status: EmployeeStatus,
    @CurrentUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.updateEmploymentStatus(employeeId, status, user.id);
  }
}
