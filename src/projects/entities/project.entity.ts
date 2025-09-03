import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';
import { ProjectStatus, Priority, ProjectType } from '../dto/create-project.input';

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

  @Field(() => ProjectStatus)
  status: ProjectStatus;

  @Field(() => Priority)
  priority: Priority;

  @Field(() => ProjectType, { nullable: true })
  type?: ProjectType;

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

  @Field(() => Int, { defaultValue: 0 })
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
