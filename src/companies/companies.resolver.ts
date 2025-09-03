import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { User } from '../users/entities/user.entity';
import { PaginatedCompanyResponse } from './dto/paginated-company-response.dto';
import { PaginationInput } from '../common/dto/pagination.input';

@Resolver(() => Company)
@UseGuards(JwtAuthGuard)
export class CompaniesResolver {
  constructor(private readonly companiesService: CompaniesService) {}

  @Query(() => PaginatedCompanyResponse, { name: 'companies' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.READ)
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

    const result = await this.companiesService.findAll(currentUser.id, paginationOptions, filterOptions);
    return {
      items: result.data,
      pagination: result.meta,
    };
  }

  @Query(() => Company, { name: 'company' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.READ)
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.companiesService.findOne(id, currentUser.id);
  }

  @Mutation(() => Company)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.CREATE)
  createCompany(
    @Args('createCompanyInput') createCompanyInput: CreateCompanyInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.companiesService.create(createCompanyInput, currentUser.id);
  }

  @Mutation(() => Company)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.UPDATE)
  updateCompany(
    @Args('updateCompanyInput') updateCompanyInput: UpdateCompanyInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.companiesService.update(
      updateCompanyInput.id,
      updateCompanyInput,
      currentUser.id,
    );
  }

  @Mutation(() => Boolean, { description: 'Returns true if company was successfully deleted' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.DELETE)
  async removeCompany(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ) {
    await this.companiesService.remove(id, currentUser.id);
    return true;
  }

  @Mutation(() => Company)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.ASSIGN)
  assignCompany(
    @Args('companyId', { type: () => ID }) companyId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.companiesService.assignToUser(companyId, userId, currentUser.id);
  }

  @Query(() => [Company], { name: 'companiesByIndustry' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.READ)
  findByIndustry(
    @Args('industry') industry: string,
    @CurrentUser() currentUser: User,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
  ) {
    return this.companiesService.findByIndustry(
      industry,
      currentUser.id,
      { take, skip },
    );
  }

  @Query(() => [Company], { name: 'companiesByStatus' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.READ)
  findByStatus(
    @Args('status') status: string,
    @CurrentUser() currentUser: User,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
  ) {
    return this.companiesService.findByStatus(
      status,
      currentUser.id,
      { take, skip },
    );
  }

  @Query(() => [Company], { name: 'companiesByAssignedUser' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.READ)
  findByAssignedUser(
    @Args('assignedToId', { type: () => ID }) assignedToId: string,
    @CurrentUser() currentUser: User,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
  ) {
    return this.companiesService.findByAssignedUser(
      assignedToId,
      currentUser.id,
      { take, skip },
    );
  }
}
