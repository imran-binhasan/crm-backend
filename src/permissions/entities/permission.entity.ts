import { Field, ObjectType, ID } from '@nestjs/graphql';
import { BaseEntity } from '../../common/entities/base.entity';
import { ResourceType, ActionType } from '../../common/rbac/permission.types';

@ObjectType()
export class Permission extends BaseEntity {
  @Field(() => ResourceType)
  resource: ResourceType;

  @Field(() => ActionType)
  action: ActionType;

  @Field({ nullable: true })
  description?: string;
}
