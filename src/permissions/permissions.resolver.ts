import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Permission)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionsResolver {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Mutation(() => Permission)
  @RequireResource(ResourceType.PERMISSION, ActionType.CREATE)
  async createPermission(
    @Args('createPermissionInput') createPermissionInput: CreatePermissionInput,
    @CurrentUser() user: User,
  ): Promise<Permission> {
    return this.permissionsService.create(createPermissionInput, user.id);
  }

  @Query(() => [Permission], { name: 'permissions' })
  @RequireResource(ResourceType.PERMISSION, ActionType.READ)
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Permission[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    const result = await this.permissionsService.findAll(user!.id, pagination);
    return result.data;
  }

  @Query(() => Permission, { name: 'permission' })
  @RequireResource(ResourceType.PERMISSION, ActionType.READ)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Permission> {
    return this.permissionsService.findOne(id, user.id);
  }

  @Query(() => [Permission], { name: 'permissionsByResource' })
  @RequireResource(ResourceType.PERMISSION, ActionType.READ)
  async findByResource(
    @Args('resource', { type: () => ResourceType }) resource: ResourceType,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Permission[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    return this.permissionsService.findByResource(resource, user!.id, pagination);
  }

  @Query(() => [Permission], { name: 'permissionsByAction' })
  @RequireResource(ResourceType.PERMISSION, ActionType.READ)
  async findByAction(
    @Args('action', { type: () => ActionType }) action: ActionType,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Permission[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    return this.permissionsService.findByAction(action, user!.id, pagination);
  }

  @Query(() => Permission, { name: 'permissionByResourceAndAction', nullable: true })
  @RequireResource(ResourceType.PERMISSION, ActionType.READ)
  async findByResourceAndAction(
    @Args('resource', { type: () => ResourceType }) resource: ResourceType,
    @Args('action', { type: () => ActionType }) action: ActionType,
    @CurrentUser() user: User,
  ): Promise<Permission | null> {
    return this.permissionsService.findByResourceAndAction(resource, action, user.id);
  }

  @Query(() => String, { name: 'allResourcePermissions' })
  @RequireResource(ResourceType.PERMISSION, ActionType.READ)
  async getAllResourcePermissions(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<string> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    const grouped = await this.permissionsService.getAllResourcePermissions(user!.id, pagination);
    return JSON.stringify(grouped);
  }

  @Mutation(() => [Permission])
  @RequireResource(ResourceType.PERMISSION, ActionType.CREATE)
  async createResourcePermissions(
    @Args('resource', { type: () => ResourceType }) resource: ResourceType,
    @Args('actions', { type: () => [ActionType] }) actions: ActionType[],
    @CurrentUser() user: User,
  ): Promise<Permission[]> {
    return this.permissionsService.createResourcePermissions(resource, actions, user.id);
  }

  @Query(() => Boolean, { name: 'validatePermissionExists' })
  @RequireResource(ResourceType.PERMISSION, ActionType.READ)
  async validatePermissionExists(
    @Args('resource', { type: () => ResourceType }) resource: ResourceType,
    @Args('action', { type: () => ActionType }) action: ActionType,
  ): Promise<boolean> {
    return this.permissionsService.validatePermissionExists(resource, action);
  }

  @Mutation(() => Permission)
  @RequireResource(ResourceType.PERMISSION, ActionType.UPDATE)
  async updatePermission(
    @Args('updatePermissionInput') updatePermissionInput: UpdatePermissionInput,
    @CurrentUser() user: User,
  ): Promise<Permission> {
    return this.permissionsService.update(updatePermissionInput.id, updatePermissionInput, user.id);
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.PERMISSION, ActionType.DELETE)
  async removePermission(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.permissionsService.remove(id, user.id);
    return true;
  }
}
