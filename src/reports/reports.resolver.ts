import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Report } from './entities/report.entity';
import { CreateReportInput } from './dto/create-report.input';
import { UpdateReportInput } from './dto/update-report.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Report)
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Mutation(() => Report)
  @RequireResource(ResourceType.REPORT, ActionType.CREATE)
  async createReport(
    @Args('createReportInput') createReportInput: CreateReportInput,
    @CurrentUser() user: User,
  ): Promise<Report> {
    return this.reportsService.create(createReportInput, user.id);
  }

  @Query(() => [Report], { name: 'reports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    const result = await this.reportsService.findAll(user!.id, pagination);
    return result.data;
  }

  @Query(() => Report, { name: 'report' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Report> {
    return this.reportsService.findOne(id, user.id);
  }

  @Query(() => [Report], { name: 'reportsByType' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async findByType(
    @Args('type') type: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    return this.reportsService.getReportsByType(type, user!.id, take, skip);
  }

  @Query(() => [Report], { name: 'reportsByStatus' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async findByStatus(
    @Args('status') status: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    return this.reportsService.getReportsByStatus(status, user!.id, take, skip);
  }

  @Query(() => [Report], { name: 'scheduledReports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async findScheduled(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    return this.reportsService.getScheduledReports(user!.id, take, skip);
  }

  @Query(() => [Report], { name: 'pendingReports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async findPending(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    return this.reportsService.getPendingReports(user!.id, take, skip);
  }

  @Query(() => [Report], { name: 'completedReports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async findCompleted(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    return this.reportsService.getCompletedReports(user!.id, take, skip);
  }

  @Mutation(() => Report)
  @RequireResource(ResourceType.REPORT, ActionType.CREATE)
  async generateReport(
    @Args('reportId', { type: () => ID }) reportId: string,
    @Args('parameters', { type: () => String, nullable: true })
    parameters?: string,
    @CurrentUser() user?: User,
  ): Promise<Report> {
    const params = parameters ? JSON.parse(parameters) : {};
    return this.reportsService.generateReport(reportId, user!.id, params);
  }

  @Query(() => String, { name: 'executeReport' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async executeReport(
    @Args('reportId', { type: () => ID }) reportId: string,
    @Args('format', { type: () => String, defaultValue: 'JSON' })
    format: string,
    @Args('parameters', { type: () => String, nullable: true })
    parameters?: string,
    @CurrentUser() user?: User,
  ): Promise<string> {
    const params = parameters ? JSON.parse(parameters) : {};
    return this.reportsService.executeReport(
      reportId,
      user!.id,
      format,
      params,
    );
  }

  @Query(() => [Report], { name: 'salesReports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async getSalesReports(
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    return this.reportsService.getSalesReports(user!.id, {
      startDate,
      endDate,
    }, take, skip);
  }

  @Query(() => [Report], { name: 'projectReports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async getProjectReports(
    @Args('projectId', { type: () => ID, nullable: true }) projectId?: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    return this.reportsService.getProjectReports(user!.id, projectId, take, skip);
  }

  @Query(() => [Report], { name: 'financialReports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async getFinancialReports(
    @Args('period', { type: () => String, defaultValue: 'monthly' })
    period: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    return this.reportsService.getFinancialReports(user!.id, period, take, skip);
  }

  @Mutation(() => Report)
  @RequireResource(ResourceType.REPORT, ActionType.UPDATE)
  async updateReport(
    @Args('updateReportInput') updateReportInput: UpdateReportInput,
    @CurrentUser() user: User,
  ): Promise<Report> {
    return this.reportsService.update(updateReportInput.id, updateReportInput, user.id);
  }

  @Mutation(() => Report)
  @RequireResource(ResourceType.REPORT, ActionType.UPDATE)
  async updateReportStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => String }) status: string,
    @CurrentUser() user: User,
  ): Promise<Report> {
    return this.reportsService.updateReportStatus(id, status, user.id);
  }

  @Mutation(() => Report)
  @RequireResource(ResourceType.REPORT, ActionType.UPDATE)
  async scheduleReport(
    @Args('reportId', { type: () => ID }) reportId: string,
    @Args('schedule', { type: () => String }) schedule: string,
    @Args('recipients', { type: () => [String] }) recipients: string[],
    @CurrentUser() user: User,
  ): Promise<Report> {
    return this.reportsService.scheduleReport(
      reportId,
      schedule,
      recipients,
      user.id,
    );
  }

  @Mutation(() => Boolean)
  @RequireResource(ResourceType.REPORT, ActionType.DELETE)
  async removeReport(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.reportsService.remove(id, user.id);
    return true;
  }

  @Mutation(() => String)
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async exportReport(
    @Args('reportId', { type: () => ID }) reportId: string,
    @Args('format', { type: () => String, defaultValue: 'PDF' }) format: string,
    @CurrentUser() user: User,
  ): Promise<string> {
    return this.reportsService.exportReport(reportId, format, user.id);
  }
}
