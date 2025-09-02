import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class RolePermission {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  roleId: string;

  @Field(() => ID)
  permissionId: string;
}
