import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Client } from '../../clients/entities/client.entity';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class InvoiceItem {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  description: string;

  @Field(() => Float)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  totalPrice: number;

  @Field(() => Float, { nullable: true })
  taxRate?: number;

  @Field(() => Float, { nullable: true })
  taxAmount?: number;

  @Field(() => String, { nullable: true })
  unit?: string; // hours, pieces, etc.
}

@ObjectType()
export class Invoice {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  invoiceNumber: string;

  @Field(() => String)
  status: string; // DRAFT, SENT, PAID, OVERDUE, CANCELLED

  @Field(() => Date)
  issueDate: Date;

  @Field(() => Date)
  dueDate: Date;

  @Field(() => Date, { nullable: true })
  paidDate?: Date;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  terms?: string;

  // Financial details
  @Field(() => Float)
  subtotal: number;

  @Field(() => Float, { defaultValue: 0 })
  taxAmount: number;

  @Field(() => Float, { defaultValue: 0 })
  discountAmount: number;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Float, { defaultValue: 0 })
  paidAmount: number;

  @Field(() => Float)
  balanceAmount: number;

  @Field(() => String, { defaultValue: 'USD' })
  currency: string;

  @Field(() => Float, { nullable: true })
  exchangeRate?: number;

  // Payment details
  @Field(() => String, { nullable: true })
  paymentMethod?: string;

  @Field(() => String, { nullable: true })
  paymentReference?: string;

  @Field(() => [InvoiceItem])
  items: InvoiceItem[];

  // Relations
  @Field(() => String)
  clientId: string;

  @Field(() => Client)
  client: Client;

  @Field(() => String, { nullable: true })
  projectId?: string;

  @Field(() => Project, { nullable: true })
  project?: Project;

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
