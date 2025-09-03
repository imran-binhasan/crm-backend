import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  code?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  status: string; // PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED

  @Field(() => String)
  priority: string; // LOW, MEDIUM, HIGH, URGENT

  @Field(() => String, { nullable: true })
  type?: string; // FIXED_PRICE, TIME_AND_MATERIALS, RETAINER

  @Field(() => Float, { nullable: true })
  budget?: number;

  @Field(() => Float, { nullable: true })
  actualCost?: number;

  @Field(() => String, { nullable: true })
  currency?: string;

  @Field(() => Date, { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => Date, { nullable: true })
  actualStartDate?: Date;

  @Field(() => Date, { nullable: true })
  actualEndDate?: Date;

  @Field(() => Number, { defaultValue: 0 })
  progress: number; // 0-100 percentage

  // Relations
  @Field(() => String)
  clientId: string;

  @Field(() => Client)
  client: Client;

  @Field(() => String, { nullable: true })
  projectManagerId?: string;

  @Field(() => User, { nullable: true })
  projectManager?: User;

  @Field(() => [User])
  teamMembers: User[];

  // System fields
  @Field(() => String)
  createdById: string;

  @Field(() => User)
  createdBy: User;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}
