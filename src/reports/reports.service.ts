import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateReportInput } from './dto/create-report.input';
import { UpdateReportInput } from './dto/update-report.input';
import { Report } from './entities/report.entity';
import { ReportMapper } from './mappers/report.mapper';
import { ResourceType } from '../common/rbac/permission.types';

@Injectable()
export class ReportsService extends BaseService<
  Report,
  CreateReportInput,
  UpdateReportInput
> {
  protected readonly resourceType = ResourceType.REPORT;

  constructor(
    prisma: PrismaService,
    rbacService: RbacService,
  ) {
    super(prisma, rbacService, ReportsService.name);
  }

  protected mapToDomain(prismaEntity: any): Report {
    return ReportMapper.toDomain(prismaEntity);
  }

  protected async performCreate(data: CreateReportInput, currentUserId: string): Promise<Report> {
    const reportData = {
      name: data.name,
      description: data.description,
      type: data.type as any,
      format: data.format as any || 'PDF',
      status: 'PENDING' as any,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      filters: data.filters || [],
      columns: data.columns || [],
      query: data.query,
      isScheduled: data.isScheduled || false,
      schedulePattern: data.schedulePattern,
      emailOnCompletion: data.emailOnCompletion || false,
      emailRecipients: data.emailRecipients || [],
      createdById: currentUserId,
    };

    const result = await this.prisma.report.create({
      data: reportData as any,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  protected async performFindMany(options: any): Promise<Report[]> {
    const result = await this.prisma.report.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });

    return result.map(report => this.mapToDomain(report));
  }

  protected async performFindUnique(id: string): Promise<Report | null> {
    const result = await this.prisma.report.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeOptions(),
    });

    return result ? this.mapToDomain(result) : null;
  }

  protected async performUpdate(id: string, data: UpdateReportInput, currentUserId: string): Promise<Report> {
    const { id: _, ...updateData } = data;

    const processedData: any = {
      ...updateData,
      startDate: data.startDate ? new Date(data.startDate) : updateData.startDate,
      endDate: data.endDate ? new Date(data.endDate) : updateData.endDate,
    };

    const result = await this.prisma.report.update({
      where: { id },
      data: processedData,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    await this.prisma.report.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.report.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.report.count(options);
  }

  private getIncludeOptions() {
    return {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    };
  }

  // Business methods
  async getReportsByType(
    type: string,
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Report[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const reports = await this.prisma.report.findMany({
      where: { 
        type: type as any,
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    return reports.map(report => this.mapToDomain(report));
  }

  async getReportsByStatus(
    status: string,
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Report[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const reports = await this.prisma.report.findMany({
      where: { 
        status: status as any,
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    return reports.map(report => this.mapToDomain(report));
  }

  async getScheduledReports(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Report[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const reports = await this.prisma.report.findMany({
      where: { 
        isScheduled: true,
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { nextRunAt: 'asc' },
    });

    return reports.map(report => this.mapToDomain(report));
  }

  async getPendingReports(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Report[]> {
    return this.getReportsByStatus('PENDING', currentUserId, take, skip);
  }

  async getCompletedReports(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Report[]> {
    return this.getReportsByStatus('COMPLETED', currentUserId, take, skip);
  }

  async generateReport(
    reportId: string,
    currentUserId: string,
    parameters?: any,
  ): Promise<Report> {
    // Update status to generating
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: { 
        status: 'GENERATING' as any,
        lastRunAt: new Date(),
      },
      include: this.getIncludeOptions(),
    });

    try {
      // Here you would implement the actual report generation logic
      // For now, we'll simulate it by updating the status to completed
      const completedReport = await this.prisma.report.update({
        where: { id: reportId },
        data: { 
          status: 'COMPLETED' as any,
          generatedAt: new Date(),
          // In real implementation, you would set filePath and fileUrl
        },
        include: this.getIncludeOptions(),
      });

      return this.mapToDomain(completedReport);
    } catch (error) {
      // Update status to failed with error message
      const failedReport = await this.prisma.report.update({
        where: { id: reportId },
        data: { 
          status: 'FAILED' as any,
          errorMessage: error.message,
        },
        include: this.getIncludeOptions(),
      });

      return this.mapToDomain(failedReport);
    }
  }

  async executeReport(
    reportId: string,
    currentUserId: string,
    format?: string,
    parameters?: any,
  ): Promise<string> {
    const report = await this.findOne(reportId, currentUserId);
    
    // Here you would implement the actual report execution logic
    // This would generate the report data based on the report type and parameters
    
    // For now, return a mock response
    return 'report-execution-result';
  }

  async getSalesReports(
    currentUserId: string,
    dateRange?: { startDate?: Date; endDate?: Date },
    take?: number,
    skip?: number,
  ): Promise<Report[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const whereClause: any = {
      type: 'SALES',
      deletedAt: null,
      ...filters,
    };

    if (dateRange?.startDate) {
      whereClause.startDate = { gte: dateRange.startDate };
    }
    if (dateRange?.endDate) {
      whereClause.endDate = { lte: dateRange.endDate };
    }

    const reports = await this.prisma.report.findMany({
      where: whereClause,
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    return reports.map(report => this.mapToDomain(report));
  }

  async getProjectReports(
    currentUserId: string,
    projectId?: string,
    take?: number,
    skip?: number,
  ): Promise<Report[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const whereClause: any = {
      type: 'PROJECT',
      deletedAt: null,
      ...filters,
    };

    // If projectId is provided, you would add it to filters
    // This would require extending the Report model to include projectId
    // For now, we'll just filter by type

    const reports = await this.prisma.report.findMany({
      where: whereClause,
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    return reports.map(report => this.mapToDomain(report));
  }

  async getFinancialReports(
    currentUserId: string,
    period?: string,
    take?: number,
    skip?: number,
  ): Promise<Report[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const reports = await this.prisma.report.findMany({
      where: { 
        type: 'FINANCIAL',
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    return reports.map(report => this.mapToDomain(report));
  }

  async scheduleReport(
    reportId: string,
    schedule: string,
    recipients: string[],
    currentUserId: string,
  ): Promise<Report> {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: { 
        isScheduled: true,
        schedulePattern: schedule,
        emailRecipients: recipients,
        emailOnCompletion: true,
        // You would calculate nextRunAt based on the cron pattern
        nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day for demo
      },
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(report);
  }

  async updateReportStatus(
    id: string,
    status: string,
    currentUserId: string,
  ): Promise<Report> {
    const report = await this.prisma.report.update({
      where: { id },
      data: { status: status as any },
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(report);
  }

  async exportReport(
    reportId: string,
    format: string,
    currentUserId: string,
  ): Promise<string> {
    const report = await this.findOne(reportId, currentUserId);
    
    // Here you would implement the actual export logic
    // This would convert the report data to the requested format
    
    // For now, return a mock URL
    return `http://localhost:3000/api/reports/${reportId}/export?format=${format}`;
  }
}
