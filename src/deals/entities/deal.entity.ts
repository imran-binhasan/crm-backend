import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { AuditableEntity } from '../../common/entities/base.entity';

@ObjectType()
export class Deal extends AuditableEntity {
  @Field()
  title: string;

  @Field(() => ID, { nullable: true })
  contactId?: string;

  @Field(() => ID, { nullable: true })
  companyId?: string;

  @Field(() => ID, { nullable: true })
  leadId?: string;

  @Field(() => ID, { nullable: true })
  assignedToId?: string;

  @Field()
  value: number;

  @Field()
  stage: string;

  @Field()
  probability: number;

  @Field()
  priority: string;

  @Field({ nullable: true })
  expectedCloseDate?: Date;

  @Field({ nullable: true })
  actualCloseDate?: Date;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  // Relations
  @Field(() => User, { nullable: true })
  assignedTo?: User;

  @Field(() => User)
  createdBy: User;
}
