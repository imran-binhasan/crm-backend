import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { Company } from '../../companies/entities/company.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { AuditableEntity } from '../../common/entities/base.entity';

@ObjectType()
export class Activity extends AuditableEntity {
  @Field(() => String)
  type: string;

  @Field(() => String)
  subject: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Date, { nullable: true })
  scheduledAt?: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => String)
  status: string;

  @Field(() => String)
  priority: string;

  // Related entities
  @Field(() => String, { nullable: true })
  contactId?: string;

  @Field(() => Contact, { nullable: true })
  contact?: Contact;

  @Field(() => String, { nullable: true })
  companyId?: string;

  @Field(() => Company, { nullable: true })
  company?: Company;

  @Field(() => String, { nullable: true })
  leadId?: string;

  @Field(() => Lead, { nullable: true })
  lead?: Lead;

  @Field(() => String, { nullable: true })
  dealId?: string;

  @Field(() => Deal, { nullable: true })
  deal?: Deal;

  @Field(() => String, { nullable: true })
  assignedToId?: string;

  @Field(() => User, { nullable: true })
  assignedTo?: User;

  @Field(() => User)
  createdBy: User;
}
