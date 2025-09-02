import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
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
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.USER, ActionType.READ)
  findAll(@CurrentUser() currentUser: User) {
    return this.usersService.findAll(currentUser.id);
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.USER, ActionType.READ)
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.findOne(id, currentUser.id);
  }

  @Mutation(() => User)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.USER, ActionType.CREATE)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.create(createUserInput, currentUser.id);
  }

  @Mutation(() => User)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.USER, ActionType.UPDATE)
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.update(id, updateUserInput, currentUser.id);
  }

  @Mutation(() => User)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.USER, ActionType.DELETE)
  removeUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.remove(id, currentUser.id);
  }

  @Mutation(() => User)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.USER, ActionType.ASSIGN)
  assignRole(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('roleId', { type: () => ID }) roleId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.assignRole(userId, roleId, currentUser.id);
  }
}
