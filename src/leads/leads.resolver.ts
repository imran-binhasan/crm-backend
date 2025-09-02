import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';
import { CreateLeadInput } from './dto/create-lead.input';
import { UpdateLeadInput } from './dto/update-lead.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { User } from '../users/entities/user.entity';

@Resolver(() => Lead)
@UseGuards(JwtAuthGuard)
export class LeadsResolver {
  constructor(private readonly leadsService: LeadsService) {}

  @Query(() => [Lead], { name: 'leads' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.LEAD, ActionType.READ)
  findAll(
    @CurrentUser() currentUser: User,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
  ) {
    return this.leadsService.findAll(currentUser.id, take, skip);
  }

  @Query(() => Lead, { name: 'lead' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.LEAD, ActionType.READ)
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.leadsService.findOne(id, currentUser.id);
  }

  @Mutation(() => Lead)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.LEAD, ActionType.CREATE)
  createLead(
    @Args('createLeadInput') createLeadInput: CreateLeadInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.leadsService.create(createLeadInput, currentUser.id);
  }

  @Mutation(() => Lead)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.LEAD, ActionType.UPDATE)
  updateLead(
    @Args('updateLeadInput') updateLeadInput: UpdateLeadInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.leadsService.update(updateLeadInput.id, updateLeadInput, currentUser.id);
  }

  @Mutation(() => Lead)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.LEAD, ActionType.DELETE)
  removeLead(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.leadsService.remove(id, currentUser.id);
  }

  @Mutation(() => String, { description: 'Convert lead to deal and return success message' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.LEAD, ActionType.UPDATE)
  async convertLeadToDeal(
    @Args('leadId', { type: () => ID }) leadId: string,
    @CurrentUser() currentUser: User,
  ) {
    await this.leadsService.convertToDeal(leadId, currentUser.id);
    return 'Lead successfully converted to deal';
  }
}
