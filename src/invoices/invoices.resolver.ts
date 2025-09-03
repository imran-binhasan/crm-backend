import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
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

@Resolver(() => Invoice)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class InvoicesResolver {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Mutation(() => Invoice)
  @RequireResource(ResourceType.INVOICE, ActionType.CREATE)
  async createInvoice(
    @Args('createInvoiceDto') createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceDto, user.id);
  }

  @Query(() => [Invoice], { name: 'invoices' })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findAll(@CurrentUser() user: User): Promise<Invoice[]> {
    return this.invoicesService.findAll(user.id);
  }

  @Query(() => Invoice, { name: 'invoice' })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Invoice> {
    return this.invoicesService.findOne(id, user.id);
  }

  @Query(() => [Invoice], { name: 'invoicesByClient' })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findByClient(
    @Args('clientId', { type: () => ID }) clientId: string,
    @CurrentUser() user: User,
  ): Promise<Invoice[]> {
    return this.invoicesService.findByClient(clientId, user.id);
  }

  @Query(() => [Invoice], { name: 'invoicesByProject' })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findByProject(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: User,
  ): Promise<Invoice[]> {
    return this.invoicesService.findByProject(projectId, user.id);
  }

  @Query(() => [Invoice], { name: 'invoicesByStatus' })
  @RequireResource(ResourceType.INVOICE, ActionType.READ)
  async findByStatus(
    @Args('status') status: string,
    @CurrentUser() user: User,
  ): Promise<Invoice[]> {
    return this.invoicesService.findByStatus(status, user.id);
  }

  @Query(() => [Invoice], { name: 'overdueInvoices' })
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
    @Args('paymentDate', { type: () => Date, nullable: true }) paymentDate?: Date,
    @CurrentUser() user?: User,
  ): Promise<Invoice> {
    return this.invoicesService.markAsPaid(invoiceId, paidAmount, user!.id, paymentDate);
  }

  @Mutation(() => Invoice)
  @RequireResource(ResourceType.INVOICE, ActionType.UPDATE)
  async addPayment(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
    @Args('amount', { type: () => Number }) amount: number,
    @Args('paymentMethod', { type: () => String, nullable: true }) paymentMethod?: string,
    @Args('notes', { type: () => String, nullable: true }) notes?: string,
    @CurrentUser() user?: User,
  ): Promise<Invoice> {
    return this.invoicesService.addPayment(invoiceId, amount, user!.id, { paymentMethod, notes });
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
