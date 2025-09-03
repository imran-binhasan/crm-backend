import { Injectable } from '@nestjs/common';
import { Activity as PrismaActivity } from '@prisma/client';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { ResourceType } from '../common/rbac/permission.types';
import { CreateActivityInput } from './dto/create-activity.input';
import { UpdateActivityInput } from './dto/update-activity.input';
import { Activity } from './entities/activity.entity';
import { ActivityMapper } from './mappers/activity.mapper';

@Injectable()
export class ActivitiesService extends BaseService<
  Activity,
  CreateActivityInput,
  UpdateActivityInput
> {
  protected readonly resourceType = ResourceType.ACTIVITY;

  constructor(
    prisma: PrismaService,
    rbacService: RbacService,
  ) {
    super(prisma, rbacService, ActivitiesService.name);
  }

  protected mapToDomain(prismaEntity: any): Activity {
    return ActivityMapper.toDomain(prismaEntity);
  }

  protected async performCreate(data: CreateActivityInput, currentUserId: string): Promise<Activity> {
    const activityData = {
      ...data,
      createdById: currentUserId,
      type: data.type as any,
      status: (data.status as any) || 'SCHEDULED',
      priority: (data.priority as any) || 'MEDIUM',
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
    };

    const result = await this.prisma.activity.create({
      data: activityData as any,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  protected async performFindMany(options: any): Promise<Activity[]> {
    const result = await this.prisma.activity.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });

    return result.map(activity => this.mapToDomain(activity));
  }

  protected async performFindUnique(id: string): Promise<Activity | null> {
    const result = await this.prisma.activity.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeOptions(),
    });

    return result ? this.mapToDomain(result) : null;
  }

  protected async performUpdate(id: string, data: UpdateActivityInput, currentUserId: string): Promise<Activity> {
    const { id: _, ...updateData } = data;
    const processedData: any = {
      ...updateData,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : updateData.scheduledAt,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : updateData.followUpDate,
    };

    // Set completion timestamp if status is being changed to completed
    if (data.status === 'COMPLETED') {
      const existingActivity = await this.prisma.activity.findUnique({ where: { id } });
      if (!existingActivity?.completedAt) {
        processedData.completedAt = new Date();
      }
    }

    const result = await this.prisma.activity.update({
      where: { id },
      data: processedData,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    await this.prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.activity.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.activity.count(options);
  }

  private getIncludeOptions() {
    return {
      contact: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      company: {
        select: { id: true, name: true },
      },
      lead: {
        select: { id: true, title: true, status: true },
      },
      deal: {
        select: { id: true, title: true, stage: true, value: true, probability: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      assignedTo: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    };
  }

  // Business-specific methods
  async findActivitiesByContact(contactId: string, currentUserId: string): Promise<Activity[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaActivities = await this.prisma.activity.findMany({
      where: { ...filters, contactId, deletedAt: null },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });

    return prismaActivities.map(activity => this.mapToDomain(activity));
  }

  async findActivitiesByCompany(companyId: string, currentUserId: string): Promise<Activity[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaActivities = await this.prisma.activity.findMany({
      where: { ...filters, companyId, deletedAt: null },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });

    return prismaActivities.map(activity => this.mapToDomain(activity));
  }

  async findActivitiesByLead(leadId: string, currentUserId: string): Promise<Activity[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaActivities = await this.prisma.activity.findMany({
      where: { ...filters, leadId, deletedAt: null },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });

    return prismaActivities.map(activity => this.mapToDomain(activity));
  }

  async findActivitiesByDeal(dealId: string, currentUserId: string): Promise<Activity[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaActivities = await this.prisma.activity.findMany({
      where: { ...filters, dealId, deletedAt: null },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });

    return prismaActivities.map(activity => this.mapToDomain(activity));
  }

  async findUpcomingActivities(currentUserId: string): Promise<Activity[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const now = new Date();
    
    const prismaActivities = await this.prisma.activity.findMany({
      where: {
        ...filters,
        scheduledAt: { gte: now },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        deletedAt: null,
      },
      include: this.getIncludeOptions(),
      orderBy: { scheduledAt: 'asc' },
      take: 50,
    });

    return prismaActivities.map(activity => this.mapToDomain(activity));
  }

  async findOverdueActivities(currentUserId: string): Promise<Activity[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const now = new Date();
    
    const prismaActivities = await this.prisma.activity.findMany({
      where: {
        ...filters,
        scheduledAt: { lt: now },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        deletedAt: null,
      },
      include: this.getIncludeOptions(),
      orderBy: { scheduledAt: 'asc' },
    });

    return prismaActivities.map(activity => this.mapToDomain(activity));
  }

  async markAsCompleted(id: string, currentUserId: string): Promise<Activity> {
    return this.update(id, { id, status: 'COMPLETED' as any }, currentUserId);
  }
}
