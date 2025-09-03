import { Field, ObjectType, ID } from '@nestjs/graphql';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@ObjectType()
export class Role extends BaseEntity {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  // Relations
  @Field(() => [User], { nullable: true })
  users?: User[];

  @Field(() => [Permission], { nullable: true })
  permissions?: Permission[];

  // Computed fields
  @Field(() => Number, { nullable: true })
  userCount?: number;

  @Field(() => Number, { nullable: true })
  permissionCount?: number;
}
