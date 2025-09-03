import { Decimal } from '@prisma/client/runtime/library';
import { Invoice, InvoiceItem } from '../interfaces/invoice.interface';

export class InvoiceMapper {
  static toDomain(prismaInvoice: any): Invoice {
    return {
      id: prismaInvoice.id,
      invoiceNumber: prismaInvoice.invoiceNumber,
      clientId: prismaInvoice.clientId,
      projectId: prismaInvoice.projectId,
      issueDate: prismaInvoice.issueDate,
      dueDate: prismaInvoice.dueDate,
      paidDate: prismaInvoice.paidDate,
      description: prismaInvoice.description,
      status: prismaInvoice.status,
      subtotal: this.toNumber(prismaInvoice.subtotal),
      taxAmount: this.toNumber(prismaInvoice.taxAmount),
      discountAmount: this.toNumber(prismaInvoice.discountAmount),
      totalAmount: this.toNumber(prismaInvoice.totalAmount),
      paidAmount: this.toNumber(prismaInvoice.paidAmount),
      balanceAmount: this.toNumber(prismaInvoice.balanceAmount),
      currency: prismaInvoice.currency,
      exchangeRate: this.toNumber(prismaInvoice.exchangeRate),
      paymentMethod: prismaInvoice.paymentMethod,
      paymentReference: prismaInvoice.paymentReference,
      notes: prismaInvoice.notes,
      terms: prismaInvoice.terms,
      createdById: prismaInvoice.createdById,
      createdAt: prismaInvoice.createdAt,
      updatedAt: prismaInvoice.updatedAt,
      deletedAt: prismaInvoice.deletedAt,
      items:
        prismaInvoice.items?.map((item: any) =>
          this.toInvoiceItemDomain(item),
        ) || [],
      client: prismaInvoice.client,
      project: prismaInvoice.project,
      createdBy: prismaInvoice.createdBy,
    };
  }

  static toDomainArray(prismaInvoices: any[]): Invoice[] {
    return prismaInvoices.map((invoice) => this.toDomain(invoice));
  }

  static toInvoiceItemDomain(prismaItem: any): InvoiceItem {
    return {
      id: prismaItem.id,
      description: prismaItem.description,
      quantity: this.toNumber(prismaItem.quantity),
      unitPrice: this.toNumber(prismaItem.unitPrice),
      totalPrice: this.toNumber(prismaItem.totalPrice),
      taxRate: this.toNumber(prismaItem.taxRate),
      taxAmount: this.toNumber(prismaItem.taxAmount),
    };
  }

  private static toNumber(
    decimal: Decimal | number | null | undefined,
  ): number {
    if (decimal === null || decimal === undefined) {
      return 0;
    }
    if (typeof decimal === 'number') {
      return decimal;
    }
    return decimal.toNumber();
  }
}
