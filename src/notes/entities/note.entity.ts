import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { Company } from '../../companies/entities/company.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { AuditableEntity } from '../../common/entities/base.entity';

@ObjectType()
export class Note extends AuditableEntity {
  @Field(() => String)
  content: string;

  @Field(() => Boolean, { defaultValue: false })
  isPrivate: boolean;

  // Related entities
  @Field(() => ID, { nullable: true })
  contactId?: string;

  @Field(() => Contact, { nullable: true })
  contact?: Contact;

  @Field(() => ID, { nullable: true })
  companyId?: string;

  @Field(() => Company, { nullable: true })
  company?: Company;

  @Field(() => ID, { nullable: true })
  leadId?: string;

  @Field(() => Lead, { nullable: true })
  lead?: Lead;

  @Field(() => ID, { nullable: true })
  dealId?: string;

  @Field(() => Deal, { nullable: true })
  deal?: Deal;

  @Field(() => User)
  createdBy: User;
}
