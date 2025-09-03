import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards, ParseUUIDPipe, ParseIntPipe } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { InvoiceStatus, InvoiceFilters } from './interfaces/invoice.interface';
import {
  PaginationOptions,
  PaginatedResponse,
} from '../common/interfaces/base.interface';

@Resolver(() => Invoice)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class InvoicesResolver {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Mutation(() => Invoice, { description: 'Create a new invoice' })
  @RequireResource(ResourceType.INVOICE, ActionType.CREATE)
  async createInvoice(
    @Args('createInvoiceDto') createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceDto, user.id);
  }

  @Query(() => [Invoice], {
    name: 'invoices',
    description: 'Get paginated list of invoices with optional filtering',
  })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findAll(
    @CurrentUser() user: User,
    @Args(
      'page',
      { type: () => Int, nullable: true, defaultValue: 1 },
      ParseIntPipe,
    )
    page?: number,
    @Args(
      'limit',
      { type: () => Int, nullable: true, defaultValue: 10 },
      ParseIntPipe,
    )
    limit?: number,
    @Args('sortBy', {
      type: () => String,
      nullable: true,
      defaultValue: 'createdAt',
    })
    sortBy?: string,
    @Args('sortOrder', {
      type: () => String,
      nullable: true,
      defaultValue: 'desc',
    })
    sortOrder?: 'asc' | 'desc',
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
  ): Promise<PaginatedResponse<Invoice>> {
    const pagination: PaginationOptions = { page, limit, sortBy, sortOrder };
    const filters = { search, startDate, endDate };

    return this.invoicesService.findAll(user.id, pagination, filters);
  }

  @Query(() => Invoice, {
    name: 'invoice',
    description: 'Get a specific invoice by ID',
  })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoicesService.findOne(id, user.id);
  }

  @Query(() => [Invoice], {
    name: 'invoicesByClient',
    description: 'Get all invoices for a specific client',
  })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findByClient(
    @Args('clientId', { type: () => ID }, ParseUUIDPipe) clientId: string,
    @Args('status', { type: () => String, nullable: true })
    status?: InvoiceStatus,
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @CurrentUser() user?: User,
  ): Promise<Invoice[]> {
    const filters: InvoiceFilters = { status, startDate, endDate };
    return this.invoicesService.findByClient(clientId, user!.id, filters);
  }

  @Query(() => [Invoice], {
    name: 'invoicesByProject',
    description: 'Get all invoices for a specific project',
  })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findByProject(
    @Args('projectId', { type: () => ID }, ParseUUIDPipe) projectId: string,
    @Args('status', { type: () => String, nullable: true })
    status?: InvoiceStatus,
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @CurrentUser() user?: User,
  ): Promise<Invoice[]> {
    const filters: InvoiceFilters = { status, startDate, endDate };
    return this.invoicesService.findByProject(projectId, user!.id, filters);
  }

  @Query(() => [Invoice], {
    name: 'invoicesByStatus',
    description: 'Get all invoices with a specific status',
  })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findByStatus(
    @Args('status', { type: () => String }) status: InvoiceStatus,
    @CurrentUser() user: User,
  ): Promise<Invoice[]> {
    return this.invoicesService.findByStatus(status, user.id);
  }

  @Query(() => [Invoice], {
    name: 'overdueInvoices',
    description: 'Get all overdue invoices',
  })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findOverdue(@CurrentUser() user: User): Promise<Invoice[]> {
    return this.invoicesService.findOverdue(user.id);
  }

  @Mutation(() => Invoice)
  @RequireResource(ResourceType.INVOICE, ActionType.UPDATE)
  async updateInvoice(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateInvoiceDto') updateInvoiceDto: UpdateInvoiceDto,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoicesService.update(id, updateInvoiceDto, user.id);
  }

  @Mutation(() => Invoice)
  @RequireResource(ResourceType.INVOICE, ActionType.UPDATE)
  async sendInvoice(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoicesService.sendInvoice(invoiceId, user.id);
  }

  @Mutation(() => Invoice)
  @RequireResource(ResourceType.INVOICE, ActionType.UPDATE)
  async markAsPaid(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
    @Args('paidAmount', { type: () => Number }) paidAmount: number,
    @Args('paymentDate', { type: () => Date, nullable: true })
    paymentDate?: Date,
    @CurrentUser() user?: User,
  ): Promise<Invoice> {
    return this.invoicesService.markAsPaid(
      invoiceId,
      paidAmount,
      user!.id,
      paymentDate,
    );
  }

  @Mutation(() => Invoice)
  @RequireResource(ResourceType.INVOICE, ActionType.UPDATE)
  async addPayment(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
    @Args('amount', { type: () => Number }) amount: number,
    @Args('paymentMethod', { type: () => String, nullable: true })
    paymentMethod?: string,
    @Args('notes', { type: () => String, nullable: true }) notes?: string,
    @CurrentUser() user?: User,
  ): Promise<Invoice> {
    return this.invoicesService.addPayment(invoiceId, amount, user!.id, {
      paymentMethod,
      notes,
    });
  }

  @Mutation(() => Invoice)
  @RequireResource(ResourceType.INVOICE, ActionType.CREATE)
  async generateRecurringInvoice(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoicesService.generateRecurring(invoiceId, user.id);
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.INVOICE, ActionType.DELETE)
  async removeInvoice(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.invoicesService.remove(id, user.id);
    return true;
  }

  @Query(() => String, { name: 'generateInvoicePDF' })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async generatePDF(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
    @CurrentUser() user: User,
  ): Promise<string> {
    return this.invoicesService.generatePDF(invoiceId, user.id);
  }
}
