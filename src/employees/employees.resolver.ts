import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RbacGuard } from '../common/rbac/rbac.guard';
import { RequirePermissions } from '../common/rbac/rbac.decorator';
import { ResourceType, ActionType } from '../common/rbac/rbac.types';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Employee)
@UseGuards(GqlAuthGuard, RbacGuard)
export class EmployeesResolver {
  constructor(private readonly employeesService: EmployeesService) {}

  @Mutation(() => Employee)
  @RequirePermissions({ resource: ResourceType.EMPLOYEE, action: ActionType.CREATE })
  async createEmployee(
    @Args('createEmployeeDto') createEmployeeDto: CreateEmployeeDto,
    @GetUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.create(createEmployeeDto, user.id);
  }

  @Query(() => [Employee], { name: 'employees' })
  @RequirePermissions({ resource: ResourceType.EMPLOYEE, action: ActionType.READ })
  async findAll(@GetUser() user: User): Promise<Employee[]> {
    return this.employeesService.findAll(user.id);
  }

  @Query(() => Employee, { name: 'employee' })
  @RequirePermissions({ resource: ResourceType.EMPLOYEE, action: ActionType.READ })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @GetUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.findOne(id, user.id);
  }

  @Query(() => [Employee], { name: 'employeesByDepartment' })
  @RequirePermissions({ resource: ResourceType.EMPLOYEE, action: ActionType.READ })
  async findByDepartment(
    @Args('department') department: string,
    @GetUser() user: User,
  ): Promise<Employee[]> {
    return this.employeesService.findByDepartment(department, user.id);
  }

  @Query(() => [Employee], { name: 'employeesByManager' })
  @RequirePermissions({ resource: ResourceType.EMPLOYEE, action: ActionType.READ })
  async findByManager(
    @Args('managerId', { type: () => ID }) managerId: string,
    @GetUser() user: User,
  ): Promise<Employee[]> {
    return this.employeesService.findByManager(managerId, user.id);
  }

  @Query(() => [Employee], { name: 'employeeHierarchy' })
  @RequirePermissions({ resource: ResourceType.EMPLOYEE, action: ActionType.READ })
  async getHierarchy(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @GetUser() user: User,
  ): Promise<Employee[]> {
    return this.employeesService.getEmployeeHierarchy(employeeId, user.id);
  }

  @Mutation(() => Employee)
  @RequirePermissions({ resource: ResourceType.EMPLOYEE, action: ActionType.UPDATE })
  async updateEmployee(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateEmployeeDto') updateEmployeeDto: UpdateEmployeeDto,
    @GetUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.update(id, updateEmployeeDto, user.id);
  }

  @Mutation(() => Boolean)
  @RequirePermissions({ resource: ResourceType.EMPLOYEE, action: ActionType.DELETE })
  async removeEmployee(
    @Args('id', { type: () => ID }) id: string,
    @GetUser() user: User,
  ): Promise<boolean> {
    await this.employeesService.remove(id, user.id);
    return true;
  }

  @Mutation(() => Employee)
  @RequirePermissions({ resource: ResourceType.EMPLOYEE, action: ActionType.UPDATE })
  async assignManager(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('managerId', { type: () => ID }) managerId: string,
    @GetUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.assignManager(employeeId, managerId, user.id);
  }

  @Mutation(() => Employee)
  @RequirePermissions({ resource: ResourceType.EMPLOYEE, action: ActionType.UPDATE })
  async updateEmploymentStatus(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('status') status: string,
    @GetUser() user: User,
  ): Promise<Employee> {
    return this.employeesService.updateEmploymentStatus(employeeId, status, user.id);
  }
}
