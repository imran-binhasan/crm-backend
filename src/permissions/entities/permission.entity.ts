import { Field, ObjectType, ID } from '@nestjs/graphql';
import { BaseEntity } from '../../common/entities/base.entity';

@ObjectType()
export class Permission extends BaseEntity {
  @Field()
  resource: string;

  @Field()
  action: string;

  @Field({ nullable: true })
  description?: string;
}
