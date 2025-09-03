import { Injectable } from '@nestjs/common';
import { Project as PrismaProject } from '@prisma/client';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectMapper {
  /**
   * Maps a Prisma Project entity to GraphQL Project entity
   */
  static toDomain(prismaProject: PrismaProject & {
    client?: any;
    projectManager?: any;
    createdBy?: any;
    teamMembers?: any[];
  }): Project {
    const project = new Project();
    
    project.id = prismaProject.id;
    project.name = prismaProject.name;
    project.code = prismaProject.code ?? undefined;
    project.description = prismaProject.description ?? undefined;
    project.status = prismaProject.status as any;
    project.priority = prismaProject.priority as any;
    project.type = prismaProject.type as any;
    project.budget = prismaProject.budget ? Number(prismaProject.budget) : undefined;
    project.actualCost = prismaProject.actualCost ? Number(prismaProject.actualCost) : undefined;
    project.currency = prismaProject.currency ?? undefined;
    project.startDate = prismaProject.startDate ?? undefined;
    project.endDate = prismaProject.endDate ?? undefined;
    project.actualStartDate = prismaProject.actualStartDate ?? undefined;
    project.actualEndDate = prismaProject.actualEndDate ?? undefined;
    project.progress = prismaProject.progress;
    project.clientId = prismaProject.clientId;
    project.projectManagerId = prismaProject.projectManagerId ?? undefined;
    project.createdById = prismaProject.createdById;
    project.createdAt = prismaProject.createdAt;
    project.updatedAt = prismaProject.updatedAt;
    project.deletedAt = prismaProject.deletedAt ?? undefined;

    // Map relations
    if (prismaProject.client) {
      project.client = prismaProject.client;
    }
    
    if (prismaProject.projectManager) {
      project.projectManager = prismaProject.projectManager;
    }
    
    if (prismaProject.createdBy) {
      project.createdBy = prismaProject.createdBy;
    }

    if (prismaProject.teamMembers) {
      project.teamMembers = prismaProject.teamMembers.map((member: any) => member.user);
    }

    return project;
  }

  /**
   * Maps multiple Prisma Project entities to GraphQL Project entities
   */
  static toDomainList(prismaProjects: (PrismaProject & {
    client?: any;
    projectManager?: any;
    createdBy?: any;
    teamMembers?: any[];
  })[]): Project[] {
    return prismaProjects.map(project => this.toDomain(project));
  }
}
