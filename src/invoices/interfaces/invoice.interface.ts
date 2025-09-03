import { BaseEntity } from '../../common/interfaces/base.interface';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  description?: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  balanceAmount: number;
  currency?: string;
  exchangeRate?: number;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  terms?: string;
  items: InvoiceItem[];

  // Required field for service operations
  createdById: string;

  // Relations
  client?: any;
  project?: any;
  createdBy?: any;
  payments?: InvoicePayment[];
}

export interface InvoicePayment extends BaseEntity {
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export interface InvoiceFilters {
  clientId?: string;
  projectId?: string;
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
  isOverdue?: boolean;
  search?: string;
}

export interface PaymentOptions {
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}
