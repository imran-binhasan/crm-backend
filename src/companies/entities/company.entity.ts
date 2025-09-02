import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Company {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  revenue?: number;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => ID, { nullable: true })
  assignedToId?: string;

  @Field(() => ID)
  createdById: string;

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

  @Field()
  status: string;

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
