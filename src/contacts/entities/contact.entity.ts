import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { AuditableEntity } from '../../common/entities/base.entity';

@ObjectType()
export class Contact extends AuditableEntity {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  mobile?: string;

  @Field({ nullable: true })
  jobTitle?: string;

  @Field({ nullable: true })
  department?: string;

  @Field(() => ID, { nullable: true })
  companyId?: string;

  @Field(() => ID, { nullable: true })
  assignedToId?: string;

  // Address fields
  @Field({ nullable: true })
  street?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field({ nullable: true })
  country?: string;

  // Social media
  @Field({ nullable: true })
  linkedinUrl?: string;

  @Field({ nullable: true })
  twitterUrl?: string;

  @Field({ nullable: true })
  websiteUrl?: string;

  // Status and source
  @Field()
  status: string;

  @Field({ nullable: true })
  source?: string;

  @Field()
  isActive: boolean;

  // Relations
  @Field(() => User, { nullable: true })
  assignedTo?: User;

  @Field(() => User)
  createdBy: User;
}
