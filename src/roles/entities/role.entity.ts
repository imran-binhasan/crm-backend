import { Field, ObjectType, ID } from '@nestjs/graphql';
import { BaseEntity } from '../../common/entities/base.entity';

@ObjectType()
export class Role extends BaseEntity {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;
}
