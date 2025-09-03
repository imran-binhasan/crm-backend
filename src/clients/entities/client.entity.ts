import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { Contact } from '../../contacts/entities/contact.entity';

@ObjectType()
export class Client {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  code?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  website?: string;

  @Field(() => String, { nullable: true })
  industry?: string;

  @Field(() => String)
  type: string; // INDIVIDUAL, CORPORATE

  @Field(() => String)
  status: string; // ACTIVE, INACTIVE, SUSPENDED

  @Field(() => String, { nullable: true })
  taxId?: string;

  @Field(() => String, { nullable: true })
  billingAddress?: string;

  @Field(() => String, { nullable: true })
  shippingAddress?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  // Payment terms
  @Field(() => Number, { defaultValue: 30 })
  paymentTerms: number; // Days

  @Field(() => String, { nullable: true })
  preferredCurrency?: string;

  // Relations
  @Field(() => String, { nullable: true })
  companyId?: string;

  @Field(() => Company, { nullable: true })
  company?: Company;

  @Field(() => String, { nullable: true })
  primaryContactId?: string;

  @Field(() => Contact, { nullable: true })
  primaryContact?: Contact;

  @Field(() => String, { nullable: true })
  accountManagerId?: string;

  @Field(() => User, { nullable: true })
  accountManager?: User;

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
