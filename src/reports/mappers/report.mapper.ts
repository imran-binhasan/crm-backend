import { Injectable } from '@nestjs/common';
import { Report as PrismaReport } from '@prisma/client';
import { Report } from '../entities/report.entity';

@Injectable()
export class ReportMapper {
  /**
   * Maps a Prisma Report entity to GraphQL Report entity
   */
  static toDomain(prismaReport: PrismaReport & {
    createdBy?: any;
  }): Report {
    const report = new Report();
    
    report.id = prismaReport.id;
    report.name = prismaReport.name;
    report.description = prismaReport.description ?? undefined;
    report.type = prismaReport.type as any;
    report.format = prismaReport.format as any;
    report.status = prismaReport.status as any;
    report.startDate = prismaReport.startDate ?? undefined;
    report.endDate = prismaReport.endDate ?? undefined;
    
    // Parse JSON fields
    report.filters = prismaReport.filters ? (prismaReport.filters as any) : [];
    report.columns = prismaReport.columns ? (prismaReport.columns as any) : [];
    report.emailRecipients = prismaReport.emailRecipients ? (prismaReport.emailRecipients as any) : [];
    
    report.query = prismaReport.query ?? undefined;
    report.filePath = prismaReport.filePath ?? undefined;
    report.fileUrl = prismaReport.fileUrl ?? undefined;
    report.fileSize = prismaReport.fileSize ? Number(prismaReport.fileSize) : undefined;
    report.generatedAt = prismaReport.generatedAt ?? undefined;
    report.errorMessage = prismaReport.errorMessage ?? undefined;
    report.isScheduled = prismaReport.isScheduled;
    report.schedulePattern = prismaReport.schedulePattern ?? undefined;
    report.nextRunAt = prismaReport.nextRunAt ?? undefined;
    report.lastRunAt = prismaReport.lastRunAt ?? undefined;
    report.emailOnCompletion = prismaReport.emailOnCompletion;
    report.createdById = prismaReport.createdById;
    report.createdAt = prismaReport.createdAt;
    report.updatedAt = prismaReport.updatedAt;
    report.deletedAt = prismaReport.deletedAt ?? undefined;

    // Map relations
    if (prismaReport.createdBy) {
      report.createdBy = prismaReport.createdBy;
    }

    return report;
  }

  /**
   * Maps multiple Prisma Report entities to GraphQL Report entities
   */
  static toDomainList(prismaReports: (PrismaReport & {
    createdBy?: any;
  })[]): Report[] {
    return prismaReports.map(report => this.toDomain(report));
  }
}
