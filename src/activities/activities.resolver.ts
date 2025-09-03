import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { Activity } from './entities/activity.entity';
import { CreateActivityInput } from './dto/create-activity.input';
import { UpdateActivityInput } from './dto/update-activity.input';
import { PaginatedActivityResponse } from './dto/paginated-activity-response.dto';
import { PaginationInput } from '../common/dto/pagination.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { User } from '../users/entities/user.entity';

@Resolver(() => Activity)
@UseGuards(JwtAuthGuard)
export class ActivitiesResolver {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Query(() => PaginatedActivityResponse, { name: 'activities' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.ACTIVITY, ActionType.READ)
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

    const result = await this.activitiesService.findAll(currentUser.id, paginationOptions, filterOptions);
    return {
      items: result.data,
      pagination: result.meta,
    };
  }

  @Query(() => Activity, { name: 'activity' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.ACTIVITY, ActionType.READ)
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Activity> {
    return this.activitiesService.findOne(id, currentUser.id);
  }

  @Mutation(() => Activity)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.ACTIVITY, ActionType.CREATE)
  createActivity(
    @Args('createActivityInput') createActivityInput: CreateActivityInput,
    @CurrentUser() currentUser: User,
  ): Promise<Activity> {
    return this.activitiesService.create(createActivityInput, currentUser.id);
  }

  @Mutation(() => Activity)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.ACTIVITY, ActionType.UPDATE)
  updateActivity(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateActivityInput') updateActivityInput: UpdateActivityInput,
    @CurrentUser() currentUser: User,
  ): Promise<Activity> {
    return this.activitiesService.update(id, updateActivityInput, currentUser.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.ACTIVITY, ActionType.DELETE)
  async removeActivity(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.activitiesService.remove(id, currentUser.id);
    return true;
  }

  @Query(() => [Activity])
  async activitiesByContact(
    @Args('contactId', { type: () => ID }) contactId: string,
    @CurrentUser() currentUser: User,
  ): Promise<Activity[]> {
    return this.activitiesService.findActivitiesByContact(contactId, currentUser.id);
  }

  @Query(() => [Activity])
  async activitiesByCompany(
    @Args('companyId', { type: () => ID }) companyId: string,
    @CurrentUser() currentUser: User,
  ): Promise<Activity[]> {
    return this.activitiesService.findActivitiesByCompany(companyId, currentUser.id);
  }

  @Query(() => [Activity])
  async activitiesByLead(
    @Args('leadId', { type: () => ID }) leadId: string,
    @CurrentUser() currentUser: User,
  ): Promise<Activity[]> {
    return this.activitiesService.findActivitiesByLead(leadId, currentUser.id);
  }

  @Query(() => [Activity])
  async activitiesByDeal(
    @Args('dealId', { type: () => ID }) dealId: string,
    @CurrentUser() currentUser: User,
  ): Promise<Activity[]> {
    return this.activitiesService.findActivitiesByDeal(dealId, currentUser.id);
  }

  @Query(() => [Activity])
  async upcomingActivities(
    @CurrentUser() currentUser: User,
  ): Promise<Activity[]> {
    return this.activitiesService.findUpcomingActivities(currentUser.id);
  }

  @Query(() => [Activity])
  async overdueActivities(
    @CurrentUser() currentUser: User,
  ): Promise<Activity[]> {
    return this.activitiesService.findOverdueActivities(currentUser.id);
  }

  @Mutation(() => Activity)
  async markActivityAsCompleted(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Activity> {
    return this.activitiesService.markAsCompleted(id, currentUser.id);
  }
}
