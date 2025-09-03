import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';

@Resolver(() => User)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  @RequireResource(ResourceType.USER, ActionType.CREATE)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.usersService.create(createUserInput, user.id);
  }

  @Query(() => String, { name: 'users' })
  @RequireResource(ResourceType.USER, ActionType.READ)
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<string> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    const result = await this.usersService.findAll(user!.id, pagination);
    return JSON.stringify(result);
  }

  @Query(() => User, { name: 'user' })
  @RequireResource(ResourceType.USER, ActionType.READ)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.usersService.findOne(id, user.id);
  }

  @Query(() => User, { name: 'userByEmail', nullable: true })
  @RequireResource(ResourceType.USER, ActionType.READ)
  async findByEmail(
    @Args('email') email: string,
    @CurrentUser() user: User,
  ): Promise<User | null> {
    return this.usersService.findByEmail(email, user.id);
  }

  @Query(() => [User], { name: 'activeUsers' })
  @RequireResource(ResourceType.USER, ActionType.READ)
  async findActiveUsers(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<User[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    return this.usersService.findActiveUsers(user!.id, pagination);
  }

  @Query(() => [User], { name: 'usersByRole' })
  @RequireResource(ResourceType.USER, ActionType.READ)
  async getUsersByRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<User[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    return this.usersService.getUsersByRole(roleId, user!.id, pagination);
  }

  @Query(() => User, { name: 'userProfile' })
  @RequireResource(ResourceType.USER, ActionType.READ)
  async getUserWithFullProfile(
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.usersService.getUserWithFullProfile(userId, user.id);
  }

  @Mutation(() => User)
  @RequireResource(ResourceType.USER, ActionType.UPDATE)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, user.id);
  }

  @Mutation(() => User)
  @RequireResource(ResourceType.USER, ActionType.UPDATE)
  async assignRole(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('roleId', { type: () => ID }) roleId: string,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.usersService.assignRole(userId, roleId, user.id);
  }

  @Mutation(() => User)
  @RequireResource(ResourceType.USER, ActionType.UPDATE)
  async toggleUserStatus(
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.usersService.toggleUserStatus(userId, user.id);
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.USER, ActionType.UPDATE)
  async changePassword(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('newPassword') newPassword: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.usersService.changePassword(userId, newPassword, user.id);
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.USER, ActionType.DELETE)
  async removeUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.usersService.remove(id, user.id);
    return true;
  }
}
