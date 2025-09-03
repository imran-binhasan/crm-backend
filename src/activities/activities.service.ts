import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateActivityInput } from './dto/create-activity.input';
import { UpdateActivityInput } from './dto/update-activity.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { Activity } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(
    data: CreateActivityInput,
    currentUserId: string,
  ): Promise<Activity> {
    const canCreate = await this.rbacService.hasPermission(currentUserId, {
      resource: ResourceType.ACTIVITY,
      action: ActionType.CREATE,
    });
    if (!canCreate) {
      throw new ForbiddenException(
        'Insufficient permissions to create activity',
      );
    }

    const activityData = {
      ...data,
      createdById: currentUserId,
      type: data.type as any,
      status: (data.status as any) || 'SCHEDULED',
      priority: (data.priority as any) || 'MEDIUM',
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
    };

    return this.prisma.activity.create({
      data: activityData as any,
      include: {
        contact: true,
        company: true,
        lead: true,
        deal: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findAll(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Activity[]> {
    const hasPermission = await this.rbacService.hasPermission(currentUserId, {
      resource: ResourceType.ACTIVITY,
      action: ActionType.READ,
    });
    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions to access activities',
      );
    }

    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      ResourceType.ACTIVITY,
    );

    return this.prisma.activity.findMany({
      where: { deletedAt: null, ...filters },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        lead: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true, value: true } },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUserId: string): Promise<Activity> {
    const activity = await this.prisma.activity.findUnique({
      where: { id, deletedAt: null },
      include: {
        contact: true,
        company: true,
        lead: true,
        deal: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const canRead = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.ACTIVITY, action: ActionType.READ },
      activity,
    );
    if (!canRead) {
      throw new ForbiddenException(
        'Insufficient permissions to view this activity',
      );
    }

    return activity;
  }

  async update(
    id: string,
    data: UpdateActivityInput,
    currentUserId: string,
  ): Promise<Activity> {
    const existingActivity = await this.prisma.activity.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingActivity) {
      throw new NotFoundException('Activity not found');
    }

    const canUpdate = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.ACTIVITY, action: ActionType.UPDATE },
      existingActivity,
    );
    if (!canUpdate) {
      throw new ForbiddenException(
        'Insufficient permissions to update this activity',
      );
    }

    const { id: _, ...updateData } = data;
    const processedData: any = {
      ...updateData,
      scheduledAt: data.scheduledAt
        ? new Date(data.scheduledAt)
        : updateData.scheduledAt,
      followUpDate: data.followUpDate
        ? new Date(data.followUpDate)
        : updateData.followUpDate,
    };

    if (data.status === 'COMPLETED' && !existingActivity.completedAt) {
      processedData.completedAt = new Date();
    }

    return this.prisma.activity.update({
      where: { id },
      data: processedData,
      include: {
        contact: true,
        company: true,
        lead: true,
        deal: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async remove(id: string, currentUserId: string): Promise<Activity> {
    const existingActivity = await this.prisma.activity.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingActivity) {
      throw new NotFoundException('Activity not found');
    }

    const canDelete = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.ACTIVITY, action: ActionType.DELETE },
      existingActivity,
    );
    if (!canDelete) {
      throw new ForbiddenException(
        'Insufficient permissions to delete this activity',
      );
    }

    return this.prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: {
        contact: true,
        company: true,
        lead: true,
        deal: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }
}
