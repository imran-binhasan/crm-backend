import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { Company } from '../../companies/entities/company.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Deal } from '../../deals/entities/deal.entity';

@ObjectType()
export class Note {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => Boolean, { defaultValue: false })
  isPrivate: boolean;

  @Field(() => [String], { defaultValue: [] })
  tags: string[];

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
