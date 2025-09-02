import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Lead {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => ID, { nullable: true })
  contactId?: string;

  @Field(() => ID, { nullable: true })
  companyId?: string;

  @Field(() => ID, { nullable: true })
  assignedToId?: string;

  @Field(() => ID)
  createdById: string;

  @Field({ nullable: true })
  value?: number;

  @Field({ nullable: true })
  source?: string;

  @Field()
  status: string;

  @Field()
  priority: string;

  @Field({ nullable: true })
  expectedCloseDate?: Date;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  // Relations
  @Field(() => User, { nullable: true })
  assignedTo?: User;

  @Field(() => User)
  createdBy: User;
}
