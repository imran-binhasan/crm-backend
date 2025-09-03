import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
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
    @Args('createReportDto') createReportDto: CreateReportDto,
    @CurrentUser() user: User,
  ): Promise<Report> {
    return this.reportsService.create(createReportDto, user.id);
  }

  @Query(() => [Report], { name: 'reports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async findAll(@CurrentUser() user: User): Promise<Report[]> {
    return this.reportsService.findAll(user.id);
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
    @CurrentUser() user: User,
  ): Promise<Report[]> {
    return this.reportsService.findByType(type, user.id);
  }

  @Query(() => [Report], { name: 'scheduledReports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async findScheduled(@CurrentUser() user: User): Promise<Report[]> {
    return this.reportsService.findScheduled(user.id);
  }

  @Mutation(() => Report)
  @RequireResource(ResourceType.REPORT, ActionType.CREATE)
  async generateReport(
    @Args('reportId', { type: () => ID }) reportId: string,
    @Args('parameters', { type: () => String, nullable: true }) parameters?: string,
    @CurrentUser() user?: User,
  ): Promise<Report> {
    const params = parameters ? JSON.parse(parameters) : {};
    return this.reportsService.generateReport(reportId, user!.id, params);
  }

  @Query(() => String, { name: 'executeReport' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async executeReport(
    @Args('reportId', { type: () => ID }) reportId: string,
    @Args('format', { type: () => String, defaultValue: 'JSON' }) format: string,
    @Args('parameters', { type: () => String, nullable: true }) parameters?: string,
    @CurrentUser() user?: User,
  ): Promise<string> {
    const params = parameters ? JSON.parse(parameters) : {};
    return this.reportsService.executeReport(reportId, user!.id, format, params);
  }

  @Query(() => [Report], { name: 'salesReports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async getSalesReports(
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    return this.reportsService.getSalesReports(user!.id, { startDate, endDate });
  }

  @Query(() => [Report], { name: 'projectReports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async getProjectReports(
    @Args('projectId', { type: () => ID, nullable: true }) projectId?: string,
    @CurrentUser() user?: User,
  ): Promise<Report[]> {
    return this.reportsService.getProjectReports(user!.id, projectId);
  }

  @Query(() => [Report], { name: 'financialReports' })
  @RequireResource(ResourceType.REPORT, ActionType.READ)
  async getFinancialReports(
    @Args('period', { type: () => String, defaultValue: 'monthly' }) period: string,
    @CurrentUser() user: User,
  ): Promise<Report[]> {
    return this.reportsService.getFinancialReports(user.id, period);
  }

  @Mutation(() => Report)
  @RequireResource(ResourceType.REPORT, ActionType.UPDATE)
  async updateReport(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateReportDto') updateReportDto: UpdateReportDto,
    @CurrentUser() user: User,
  ): Promise<Report> {
    return this.reportsService.update(id, updateReportDto, user.id);
  }

  @Mutation(() => Report)
  @RequireResource(ResourceType.REPORT, ActionType.UPDATE)
  async scheduleReport(
    @Args('reportId', { type: () => ID }) reportId: string,
    @Args('schedule', { type: () => String }) schedule: string,
    @Args('recipients', { type: () => [String] }) recipients: string[],
    @CurrentUser() user: User,
  ): Promise<Report> {
    return this.reportsService.scheduleReport(reportId, schedule, recipients, user.id);
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
  @RequireResource(ResourceType.REPORT, ActionType.EXPORT)
  async exportReport(
    @Args('reportId', { type: () => ID }) reportId: string,
    @Args('format', { type: () => String, defaultValue: 'PDF' }) format: string,
    @CurrentUser() user: User,
  ): Promise<string> {
    return this.reportsService.exportReport(reportId, format, user.id);
  }
}
