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

@Resolver(() => Company)
@UseGuards(JwtAuthGuard)
export class CompaniesResolver {
  constructor(private readonly companiesService: CompaniesService) {}

  @Query(() => [Company], { name: 'companies' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.READ)
  findAll(
    @CurrentUser() currentUser: User,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
  ) {
    return this.companiesService.findAll(currentUser.id, take, skip);
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
    return this.companiesService.update(updateCompanyInput.id, updateCompanyInput, currentUser.id);
  }

  @Mutation(() => Company)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.COMPANY, ActionType.DELETE)
  removeCompany(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.companiesService.remove(id, currentUser.id);
  }
}
