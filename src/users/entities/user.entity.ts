import { Field, ObjectType, ID } from '@nestjs/graphql';
import { BaseEntity } from '../../common/entities/base.entity';

@ObjectType()
export class User extends BaseEntity {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  image?: string;

  @Field()
  isActive: boolean;

  @Field(() => ID)
  roleId: string;

  // Relations will be added with field resolvers
}
