import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Role)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) {}

  @Mutation(() => Role)
  @RequireResource(ResourceType.ROLE, ActionType.CREATE)
  async createRole(
    @Args('createRoleInput') createRoleInput: CreateRoleInput,
    @CurrentUser() user: User,
  ): Promise<Role> {
    return this.rolesService.create(createRoleInput, user.id);
  }

  @Query(() => [Role], { name: 'roles' })
  @RequireResource(ResourceType.ROLE, ActionType.READ)
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Role[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    const result = await this.rolesService.findAll(user!.id, pagination);
    return result.data;
  }

  @Query(() => Role, { name: 'role' })
  @RequireResource(ResourceType.ROLE, ActionType.READ)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Role> {
    return this.rolesService.findOne(id, user.id);
  }

  @Query(() => Role, { name: 'roleByName', nullable: true })
  @RequireResource(ResourceType.ROLE, ActionType.READ)
  async findByName(
    @Args('name') name: string,
    @CurrentUser() user: User,
  ): Promise<Role | null> {
    return this.rolesService.findByName(name, user.id);
  }

  @Query(() => [Role], { name: 'activeRoles' })
  @RequireResource(ResourceType.ROLE, ActionType.READ)
  async findActiveRoles(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Role[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    return this.rolesService.findActiveRoles(user!.id, pagination);
  }

  @Query(() => String, { name: 'rolePermissions' })
  @RequireResource(ResourceType.ROLE, ActionType.READ)
  async getRolePermissions(
    @Args('roleId', { type: () => ID }) roleId: string,
    @CurrentUser() user: User,
  ): Promise<string> {
    const permissions = await this.rolesService.getRolePermissions(roleId, user.id);
    return JSON.stringify(permissions);
  }

  @Query(() => String, { name: 'roleUsers' })
  @RequireResource(ResourceType.ROLE, ActionType.READ)
  async getRoleUsers(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<string> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    const users = await this.rolesService.getRoleUsers(roleId, user!.id, pagination);
    return JSON.stringify(users);
  }

  @Mutation(() => Role)
  @RequireResource(ResourceType.ROLE, ActionType.UPDATE)
  async updateRole(
    @Args('updateRoleInput') updateRoleInput: UpdateRoleInput,
    @CurrentUser() user: User,
  ): Promise<Role> {
    return this.rolesService.update(updateRoleInput.id, updateRoleInput, user.id);
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.ROLE, ActionType.UPDATE)
  async assignPermissions(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('permissionIds', { type: () => [String] }) permissionIds: string[],
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.rolesService.assignPermissions(roleId, permissionIds, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.ROLE, ActionType.UPDATE)
  async removePermissionFromRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('permissionId', { type: () => ID }) permissionId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.rolesService.removePermission(roleId, permissionId, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.ROLE, ActionType.UPDATE)
  async assignUsersToRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('userIds', { type: () => [String] }) userIds: string[],
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.rolesService.assignUsersToRole(roleId, userIds, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.ROLE, ActionType.UPDATE)
  async removeUsersFromRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('userIds', { type: () => [String] }) userIds: string[],
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.rolesService.removeUsersFromRole(roleId, userIds, user.id);
    return true;
  }

  @Mutation(() => Role)
  @RequireResource(ResourceType.ROLE, ActionType.UPDATE)
  async toggleRoleStatus(
    @Args('roleId', { type: () => ID }) roleId: string,
    @CurrentUser() user: User,
  ): Promise<Role> {
    return this.rolesService.toggleRoleStatus(roleId, user.id);
  }

  @Mutation(() => Role)
  @RequireResource(ResourceType.ROLE, ActionType.CREATE)
  async duplicateRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('newName') newName: string,
    @CurrentUser() user: User,
  ): Promise<Role> {
    return this.rolesService.duplicateRole(roleId, newName, user.id);
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.ROLE, ActionType.DELETE)
  async removeRole(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.rolesService.remove(id, user.id);
    return true;
  }
}
