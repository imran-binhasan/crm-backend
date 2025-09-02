import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';

@Resolver(() => Permission)
export class PermissionsResolver {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Query(() => [Permission], { name: 'permissions' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Query(() => Permission, { name: 'permission' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.permissionsService.findOne(id);
  }

  @Mutation(() => Permission)
  createPermission(@Args('createPermissionInput') createPermissionInput: CreatePermissionInput) {
    return this.permissionsService.create(createPermissionInput);
  }

  @Mutation(() => Permission)
  updatePermission(
    @Args('id', { type: () => ID }) id: string,
    @Args('updatePermissionInput') updatePermissionInput: UpdatePermissionInput,
  ) {
    return this.permissionsService.update(id, updatePermissionInput);
  }

  @Mutation(() => Permission)
  removePermission(@Args('id', { type: () => ID }) id: string) {
    return this.permissionsService.remove(id);
  }
}
