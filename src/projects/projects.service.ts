import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(data: CreateProjectInput, currentUserId: string) {
    const canCreate = await this.rbacService.hasPermission(currentUserId, {
      resource: ResourceType.PROJECT,
      action: ActionType.CREATE,
    });
    if (!canCreate) {
      throw new ForbiddenException(
        'Insufficient permissions to create project',
      );
    }

    const projectData = {
      ...data,
      createdById: currentUserId,
      status: (data.status as any) || 'PLANNING',
      priority: (data.priority as any) || 'MEDIUM',
      type: (data.type as any) || 'FIXED_PRICE',
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      actualStartDate: data.actualStartDate
        ? new Date(data.actualStartDate)
        : null,
      actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : null,
    };

    return this.prisma.project.create({
      data: projectData as any,
      include: {
        client: { select: { id: true, name: true } },
        projectManager: {
          select: { id: true, firstName: true, lastName: true },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAll(currentUserId: string, take?: number, skip?: number) {
    const hasPermission = await this.rbacService.hasPermission(currentUserId, {
      resource: ResourceType.PROJECT,
      action: ActionType.READ,
    });
    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions to access projects',
      );
    }

    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      ResourceType.PROJECT,
    );

    return this.prisma.project.findMany({
      where: { deletedAt: null, ...filters },
      include: {
        client: { select: { id: true, name: true } },
        projectManager: {
          select: { id: true, firstName: true, lastName: true },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUserId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id, deletedAt: null },
      include: {
        client: true,
        projectManager: {
          select: { id: true, firstName: true, lastName: true },
        },
        teamMembers: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canRead = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.PROJECT, action: ActionType.READ },
      project,
    );
    if (!canRead) {
      throw new ForbiddenException(
        'Insufficient permissions to view this project',
      );
    }

    return project;
  }

  async update(id: string, data: UpdateProjectInput, currentUserId: string) {
    const existingProject = await this.prisma.project.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    const canUpdate = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.PROJECT, action: ActionType.UPDATE },
      existingProject,
    );
    if (!canUpdate) {
      throw new ForbiddenException(
        'Insufficient permissions to update this project',
      );
    }

    const { id: _, teamMemberIds, ...updateData } = data;

    const processedData = {
      ...updateData,
      startDate: data.startDate
        ? new Date(data.startDate)
        : updateData.startDate,
      endDate: data.endDate ? new Date(data.endDate) : updateData.endDate,
      actualStartDate: data.actualStartDate
        ? new Date(data.actualStartDate)
        : updateData.actualStartDate,
      actualEndDate: data.actualEndDate
        ? new Date(data.actualEndDate)
        : updateData.actualEndDate,
    };

    return this.prisma.project.update({
      where: { id },
      data: processedData as any,
      include: {
        client: true,
        projectManager: {
          select: { id: true, firstName: true, lastName: true },
        },
        teamMembers: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string, currentUserId: string) {
    const existingProject = await this.prisma.project.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    const canDelete = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.PROJECT, action: ActionType.DELETE },
      existingProject,
    );
    if (!canDelete) {
      throw new ForbiddenException(
        'Insufficient permissions to delete this project',
      );
    }

    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: {
        client: { select: { id: true, name: true } },
        projectManager: {
          select: { id: true, firstName: true, lastName: true },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
