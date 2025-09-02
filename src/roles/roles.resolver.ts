import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';

@Resolver(() => Role)
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) {}

  @Query(() => [Role], { name: 'roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Query(() => Role, { name: 'role' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.rolesService.findOne(id);
  }

  @Mutation(() => Role)
  createRole(@Args('createRoleInput') createRoleInput: CreateRoleInput) {
    return this.rolesService.create(createRoleInput);
  }

  @Mutation(() => Role)
  updateRole(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateRoleInput') updateRoleInput: UpdateRoleInput,
  ) {
    return this.rolesService.update(id, updateRoleInput);
  }

  @Mutation(() => Role)
  removeRole(@Args('id', { type: () => ID }) id: string) {
    return this.rolesService.remove(id);
  }
}
