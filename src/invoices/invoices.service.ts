import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { BaseService } from '../common/services/base.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  Invoice,
  InvoiceStatus,
  InvoiceFilters,
  PaymentOptions,
} from './interfaces/invoice.interface';
import { ResourceType } from '../common/rbac/permission.types';
import { FilterOptions } from '../common/interfaces/base.interface';
import { InvoiceMapper } from './mappers/invoice.mapper';

@Injectable()
export class InvoicesService extends BaseService<
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto
> {
  protected readonly resourceType = ResourceType.INVOICE;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly rbacService: RbacService,
  ) {
    super(prisma, rbacService, 'InvoicesService');
  }

  // Implementation of abstract methods
  protected async performCreate(
    createInvoiceDto: CreateInvoiceDto,
    currentUserId: string,
  ): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate financial amounts
    const subtotal =
      createInvoiceDto.items?.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      ) || 0;
    const taxAmount = createInvoiceDto.taxAmount || 0;
    const discountAmount = createInvoiceDto.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        issueDate: new Date(createInvoiceDto.issueDate),
        dueDate: new Date(createInvoiceDto.dueDate),
        status: InvoiceStatus.DRAFT,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        currency: createInvoiceDto.currency || 'USD',
        description: createInvoiceDto.description,
        notes: createInvoiceDto.notes,
        terms: createInvoiceDto.terms,
        createdById: currentUserId,
        clientId: createInvoiceDto.clientId,
        projectId: createInvoiceDto.projectId,
        paymentMethod: createInvoiceDto.paymentMethod,
        paymentReference: createInvoiceDto.paymentReference,
        exchangeRate: createInvoiceDto.exchangeRate,
      },
      include: this.getIncludeOptions(),
    });

    // Create invoice items if provided
    if (createInvoiceDto.items && createInvoiceDto.items.length > 0) {
      await this.prisma.invoiceItem.createMany({
        data: createInvoiceDto.items.map((item) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
        })),
      });
    }

    // Fetch the invoice with items included
    const completeInvoice = await this.prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: this.getIncludeOptions(),
    });

    return InvoiceMapper.toDomain(completeInvoice);
  }

  protected async performFindMany(options: any): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });
    return InvoiceMapper.toDomainArray(invoices);
  }

  protected async performFindUnique(id: string): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: this.getIncludeOptions(),
    });
    return invoice ? InvoiceMapper.toDomain(invoice) : null;
  }

  protected async performUpdate(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    currentUserId: string,
  ): Promise<Invoice> {
    const updateData: any = { ...updateInvoiceDto };

    if (updateInvoiceDto.issueDate) {
      updateData.issueDate = new Date(updateInvoiceDto.issueDate);
    }
    if (updateInvoiceDto.dueDate) {
      updateData.dueDate = new Date(updateInvoiceDto.dueDate);
    }

    // Remove fields that don't exist in Prisma schema
    delete updateData.updatedById;
    updateData.updatedAt = new Date();

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: this.getIncludeOptions(),
    });

    return InvoiceMapper.toDomain(invoice);
  }

  protected async performSoftDelete(
    id: string,
    currentUserId: string,
  ): Promise<void> {
    await this.prisma.invoice.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.invoice.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.invoice.count(options);
  }

  // Custom methods for Invoice-specific operations
  async findByClient(
    clientId: string,
    currentUserId: string,
    filters?: InvoiceFilters,
  ): Promise<Invoice[]> {
    await this.checkPermission(currentUserId, ResourceType.INVOICE as any);

    const where = {
      clientId,
      deletedAt: null,
      ...this.buildInvoiceFilters(filters),
    };

    return this.safeExecute(async () => {
      const invoices = await this.prisma.invoice.findMany({
        where,
        include: this.getIncludeOptions(),
        orderBy: { createdAt: 'desc' },
      });
      return InvoiceMapper.toDomainArray(invoices);
    }, `Failed to find invoices for client ${clientId}`);
  }

  async findByProject(
    projectId: string,
    currentUserId: string,
    filters?: InvoiceFilters,
  ): Promise<Invoice[]> {
    await this.checkPermission(currentUserId, ResourceType.INVOICE as any);

    const where = {
      projectId,
      deletedAt: null,
      ...this.buildInvoiceFilters(filters),
    };

    return this.safeExecute(async () => {
      const invoices = await this.prisma.invoice.findMany({
        where,
        include: this.getIncludeOptions(),
        orderBy: { createdAt: 'desc' },
      });
      return InvoiceMapper.toDomainArray(invoices);
    }, `Failed to find invoices for project ${projectId}`);
  }

  async findByStatus(
    status: InvoiceStatus,
    currentUserId: string,
  ): Promise<Invoice[]> {
    await this.checkPermission(currentUserId, ResourceType.INVOICE as any);

    return this.safeExecute(async () => {
      const invoices = await this.prisma.invoice.findMany({
        where: {
          status,
          deletedAt: null,
        },
        include: this.getIncludeOptions(),
        orderBy: { createdAt: 'desc' },
      });
      return InvoiceMapper.toDomainArray(invoices);
    }, `Failed to find invoices with status ${status}`);
  }

  async findOverdue(currentUserId: string): Promise<Invoice[]> {
    await this.checkPermission(currentUserId, ResourceType.INVOICE as any);

    return this.safeExecute(async () => {
      const invoices = await this.prisma.invoice.findMany({
        where: {
          dueDate: {
            lt: new Date(),
          },
          status: {
            in: [InvoiceStatus.SENT],
          },
          deletedAt: null,
        },
        include: this.getIncludeOptions(),
        orderBy: { dueDate: 'asc' },
      });
      return InvoiceMapper.toDomainArray(invoices);
    }, 'Failed to find overdue invoices');
  }

  async sendInvoice(
    invoiceId: string,
    currentUserId: string,
  ): Promise<Invoice> {
    await this.checkPermission(currentUserId, ResourceType.INVOICE as any);

    const invoice = await this.findOne(invoiceId, currentUserId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    return this.safeExecute(async () => {
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.SENT,
        },
        include: this.getIncludeOptions(),
      });

      this.logger.log(`Invoice ${invoiceId} sent successfully`);
      return InvoiceMapper.toDomain(updatedInvoice);
    }, `Failed to send invoice ${invoiceId}`);
  }

  async markAsPaid(
    invoiceId: string,
    paidAmount: number,
    currentUserId: string,
    paymentDate?: Date,
  ): Promise<Invoice> {
    await this.checkPermission(currentUserId, ResourceType.INVOICE as any);

    const invoice = await this.findOne(invoiceId, currentUserId);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already marked as paid');
    }

    const totalPaidAmount = (invoice.paidAmount || 0) + paidAmount;
    const newStatus =
      totalPaidAmount >= invoice.totalAmount
        ? InvoiceStatus.PAID
        : InvoiceStatus.PAID;

    return this.safeExecute(async () => {
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: newStatus,
          paidAmount: totalPaidAmount,
          balanceAmount: invoice.totalAmount - totalPaidAmount,
          paidDate:
            newStatus === InvoiceStatus.PAID
              ? paymentDate || new Date()
              : invoice.paidDate,
        },
        include: this.getIncludeOptions(),
      });

      this.logger.log(`Invoice ${invoiceId} payment recorded: ${paidAmount}`);
      return InvoiceMapper.toDomain(updatedInvoice);
    }, `Failed to record payment for invoice ${invoiceId}`);
  }

  async addPayment(
    invoiceId: string,
    amount: number,
    currentUserId: string,
    options?: PaymentOptions,
  ): Promise<Invoice> {
    await this.checkPermission(currentUserId, ResourceType.INVOICE as any);

    const invoice = await this.findOne(invoiceId, currentUserId);

    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    const totalPaid = (invoice.paidAmount || 0) + amount;
    if (totalPaid > invoice.totalAmount) {
      throw new BadRequestException('Payment amount exceeds invoice total');
    }

    return this.safeExecute(async () => {
      // Update invoice with payment information
      const newStatus =
        totalPaid >= invoice.totalAmount
          ? InvoiceStatus.PAID
          : InvoiceStatus.PAID;

      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: totalPaid,
          balanceAmount: invoice.totalAmount - totalPaid,
          status: newStatus,
          paidDate:
            newStatus === InvoiceStatus.PAID ? new Date() : invoice.paidDate,
          paymentMethod: options?.paymentMethod || invoice.paymentMethod,
          paymentReference: options?.transactionId || invoice.paymentReference,
        },
        include: this.getIncludeOptions(),
      });

      this.logger.log(`Payment added to invoice ${invoiceId}: ${amount}`);
      return InvoiceMapper.toDomain(updatedInvoice);
    }, `Failed to add payment to invoice ${invoiceId}`);
  }

  async generateRecurring(
    invoiceId: string,
    currentUserId: string,
  ): Promise<Invoice> {
    await this.checkPermission(currentUserId, ResourceType.INVOICE as any);

    const originalInvoice = await this.findOne(invoiceId, currentUserId);

    return this.safeExecute(async () => {
      const newInvoiceNumber = await this.generateInvoiceNumber();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const recurringInvoice = await this.prisma.invoice.create({
        data: {
          invoiceNumber: newInvoiceNumber,
          clientId: originalInvoice.clientId,
          projectId: originalInvoice.projectId,
          issueDate: new Date(),
          dueDate: nextMonth,
          status: InvoiceStatus.DRAFT,
          subtotal: originalInvoice.subtotal,
          taxAmount: originalInvoice.taxAmount,
          discountAmount: originalInvoice.discountAmount,
          totalAmount: originalInvoice.totalAmount,
          paidAmount: 0,
          balanceAmount: originalInvoice.totalAmount,
          currency: originalInvoice.currency,
          description: originalInvoice.description,
          notes: originalInvoice.notes,
          terms: originalInvoice.terms,
          createdById: currentUserId,
        },
        include: this.getIncludeOptions(),
      });

      // Copy invoice items
      if (originalInvoice.items?.length) {
        await this.prisma.invoiceItem.createMany({
          data: originalInvoice.items.map((item) => ({
            invoiceId: recurringInvoice.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
          })),
        });
      }

      this.logger.log(
        `Generated recurring invoice ${recurringInvoice.id} from ${invoiceId}`,
      );
      return InvoiceMapper.toDomain(recurringInvoice);
    }, `Failed to generate recurring invoice from ${invoiceId}`);
  }

  async generatePDF(invoiceId: string, currentUserId: string): Promise<string> {
    await this.checkPermission(currentUserId, ResourceType.INVOICE as any);

    const invoice = await this.findOne(invoiceId, currentUserId);

    return this.safeExecute(async () => {
      // TODO: Implement PDF generation logic
      // This would typically use a service like Puppeteer, PDFKit, or external service
      const pdfUrl = `${process.env.BASE_URL}/api/invoices/${invoiceId}/pdf`;

      this.logger.log(`Generated PDF for invoice ${invoiceId}`);
      return pdfUrl;
    }, `Failed to generate PDF for invoice ${invoiceId}`);
  }

  // Helper methods
  private async generateInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${currentYear}${currentMonth}`,
        },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let sequenceNumber = 1;
    if (lastInvoice) {
      const lastSequence = lastInvoice.invoiceNumber.split('-').pop();
      sequenceNumber = parseInt(lastSequence || '0') + 1;
    }

    return `INV-${currentYear}${currentMonth}-${String(sequenceNumber).padStart(4, '0')}`;
  }

  private getIncludeOptions() {
    return {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      items: true,
      payments: {
        orderBy: { createdAt: 'desc' },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    };
  }

  private buildInvoiceFilters(filters?: InvoiceFilters): any {
    const where: any = {};

    if (!filters) {
      return where;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.issueDate = {};
      if (filters.startDate) {
        where.issueDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.issueDate.lte = filters.endDate;
      }
    }

    if (filters.isOverdue) {
      where.dueDate = { lt: new Date() };
      where.status = {
        in: [InvoiceStatus.SENT],
      };
    }

    return where;
  }

  protected async buildWhereClause(
    filters?: FilterOptions,
    currentUserId?: string,
  ): Promise<any> {
    const where = await super.buildWhereClause(filters, currentUserId);

    if (filters?.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
        { client: { name: { contains: filters.search, mode: 'insensitive' } } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
