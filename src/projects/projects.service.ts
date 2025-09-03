import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { Project } from './entities/project.entity';
import { ProjectMapper } from './mappers/project.mapper';
import { ResourceType } from '../common/rbac/permission.types';

@Injectable()
export class ProjectsService extends BaseService<
  Project,
  CreateProjectInput,
  UpdateProjectInput
> {
  protected readonly resourceType = ResourceType.PROJECT;

  constructor(
    prisma: PrismaService,
    rbacService: RbacService,
  ) {
    super(prisma, rbacService, ProjectsService.name);
  }

  protected mapToDomain(prismaEntity: any): Project {
    return ProjectMapper.toDomain(prismaEntity);
  }

  protected async performCreate(data: CreateProjectInput, currentUserId: string): Promise<Project> {
    // Generate project code if not provided
    const projectCode = data.code || (await this.generateProjectCode());

    const projectData = {
      ...data,
      code: projectCode,
      status: data.status as any || 'PLANNING',
      priority: data.priority as any || 'MEDIUM',
      type: data.type as any || 'FIXED_PRICE',
      createdById: currentUserId,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : null,
      actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : null,
      progress: data.progress || 0,
    };

    // Separate teamMemberIds from project data
    const { teamMemberIds, ...cleanProjectData } = projectData;

    const result = await this.prisma.project.create({
      data: cleanProjectData as any,
      include: this.getIncludeOptions(),
    });

    // Add team members if provided
    if (data.teamMemberIds && data.teamMemberIds.length > 0) {
      await this.addTeamMembers(result.id, data.teamMemberIds);
      
      // Fetch the project again with team members
      const updatedResult = await this.prisma.project.findUnique({
        where: { id: result.id },
        include: this.getIncludeOptions(),
      });
      
      return this.mapToDomain(updatedResult);
    }

    return this.mapToDomain(result);
  }

  protected async performFindMany(options: any): Promise<Project[]> {
    const result = await this.prisma.project.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });

    return result.map(project => this.mapToDomain(project));
  }

  protected async performFindUnique(id: string): Promise<Project | null> {
    const result = await this.prisma.project.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeOptions(),
    });

    return result ? this.mapToDomain(result) : null;
  }

  protected async performUpdate(id: string, data: UpdateProjectInput, currentUserId: string): Promise<Project> {
    const { id: _, teamMemberIds, ...updateData } = data;

    const processedData: any = {
      ...updateData,
      startDate: data.startDate ? new Date(data.startDate) : updateData.startDate,
      endDate: data.endDate ? new Date(data.endDate) : updateData.endDate,
      actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : updateData.actualStartDate,
      actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : updateData.actualEndDate,
    };

    const result = await this.prisma.project.update({
      where: { id },
      data: processedData,
      include: this.getIncludeOptions(),
    });

    // Update team members if provided
    if (teamMemberIds !== undefined) {
      await this.updateTeamMembers(id, teamMemberIds);
      
      // Fetch the project again with updated team members
      const updatedResult = await this.prisma.project.findUnique({
        where: { id },
        include: this.getIncludeOptions(),
      });
      
      return this.mapToDomain(updatedResult);
    }

    return this.mapToDomain(result);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.project.count(options);
  }

  private getIncludeOptions() {
    return {
      client: { select: { id: true, name: true } },
      projectManager: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      teamMembers: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    };
  }

  // Business methods
  async getProjectsByStatus(
    status: string,
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Project[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const projects = await this.prisma.project.findMany({
      where: { 
        status: status as any,
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { startDate: 'asc' },
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async getProjectsByPriority(
    priority: string,
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Project[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const projects = await this.prisma.project.findMany({
      where: { 
        priority: priority as any,
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { startDate: 'asc' },
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async getActiveProjects(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Project[]> {
    return this.getProjectsByStatus('ACTIVE', currentUserId, take, skip);
  }

  async getProjectsByClient(
    clientId: string,
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Project[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const projects = await this.prisma.project.findMany({
      where: { 
        clientId,
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { startDate: 'desc' },
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async getProjectsByManager(
    projectManagerId: string,
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Project[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const projects = await this.prisma.project.findMany({
      where: { 
        projectManagerId,
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { startDate: 'desc' },
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async updateProjectStatus(
    id: string,
    status: string,
    currentUserId: string,
  ): Promise<Project> {
    const project = await this.prisma.project.update({
      where: { id },
      data: { status: status as any },
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(project);
  }

  async updateProjectProgress(
    id: string,
    progress: number,
    currentUserId: string,
  ): Promise<Project> {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: { progress },
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(project);
  }

  private async addTeamMembers(projectId: string, userIds: string[]): Promise<void> {
    const teamMembersData = userIds.map(userId => ({
      projectId,
      userId,
    }));

    await this.prisma.projectTeamMember.createMany({
      data: teamMembersData,
      skipDuplicates: true,
    });
  }

  private async updateTeamMembers(projectId: string, userIds: string[]): Promise<void> {
    // Remove existing team members
    await this.prisma.projectTeamMember.deleteMany({
      where: { projectId },
    });

    // Add new team members
    if (userIds.length > 0) {
      await this.addTeamMembers(projectId, userIds);
    }
  }

  private async generateProjectCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const lastProject = await this.prisma.project.findFirst({
      where: { code: { startsWith: `PRJ${year}` } },
      orderBy: { code: 'desc' },
    });

    let nextNumber = 1;
    if (lastProject?.code) {
      const lastNumber = parseInt(lastProject.code.slice(5));
      nextNumber = lastNumber + 1;
    }

    return `PRJ${year}${nextNumber.toString().padStart(4, '0')}`;
  }
}
