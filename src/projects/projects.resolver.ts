import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => Project)
@UseGuards(JwtAuthGuard)
export class ProjectsResolver {
  private readonly logger = new Logger(ProjectsResolver.name);

  constructor(private readonly projectsService: ProjectsService) {}

  @Mutation(() => Project)
  async createProject(
    @Args('createProjectInput') createProjectInput: CreateProjectInput,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Creating project', {
      userId: context.req.user.sub,
      project: createProjectInput.name,
    });

    return this.projectsService.create(
      createProjectInput,
      context.req.user.sub,
    );
  }

  @Query(() => [Project], { name: 'projects' })
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    const result = await this.projectsService.findAll(context.req.user.sub, pagination);
    return result.data;
  }

  @Query(() => Project, { name: 'project' })
  async findOne(
    @Args('id', { type: () => String }) id: string,
    @Context() context: any,
  ) {
    return this.projectsService.findOne(id, context.req.user.sub);
  }

  @Mutation(() => Project)
  async updateProject(
    @Args('updateProjectInput') updateProjectInput: UpdateProjectInput,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Updating project', {
      userId: context.req.user.sub,
      projectId: updateProjectInput.id,
    });

    return this.projectsService.update(
      updateProjectInput.id,
      updateProjectInput,
      context.req.user.sub,
    );
  }

  @Mutation(() => Boolean)
  async removeProject(
    @Args('id', { type: () => String }) id: string,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Removing project', {
      userId: context.req.user.sub,
      projectId: id,
    });

    await this.projectsService.remove(id, context.req.user.sub);
    return true;
  }

  // Business query methods
  @Query(() => [Project])
  async projectsByStatus(
    @Args('status', { type: () => String }) status: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.projectsService.getProjectsByStatus(
      status,
      context.req.user.sub,
      take,
      skip,
    );
  }

  @Query(() => [Project])
  async projectsByPriority(
    @Args('priority', { type: () => String }) priority: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.projectsService.getProjectsByPriority(
      priority,
      context.req.user.sub,
      take,
      skip,
    );
  }

  @Query(() => [Project])
  async activeProjects(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.projectsService.getActiveProjects(
      context.req.user.sub,
      take,
      skip,
    );
  }

  @Query(() => [Project])
  async projectsByClient(
    @Args('clientId', { type: () => String }) clientId: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.projectsService.getProjectsByClient(
      clientId,
      context.req.user.sub,
      take,
      skip,
    );
  }

  @Query(() => [Project])
  async projectsByManager(
    @Args('projectManagerId', { type: () => String }) projectManagerId: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.projectsService.getProjectsByManager(
      projectManagerId,
      context.req.user.sub,
      take,
      skip,
    );
  }

  // Business mutation methods
  @Mutation(() => Project)
  async updateProjectStatus(
    @Args('id', { type: () => String }) id: string,
    @Args('status', { type: () => String }) status: string,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Updating project status', {
      userId: context.req.user.sub,
      projectId: id,
      status,
    });

    return this.projectsService.updateProjectStatus(
      id,
      status,
      context.req.user.sub,
    );
  }

  @Mutation(() => Project)
  async updateProjectProgress(
    @Args('id', { type: () => String }) id: string,
    @Args('progress', { type: () => Int }) progress: number,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Updating project progress', {
      userId: context.req.user.sub,
      projectId: id,
      progress,
    });

    return this.projectsService.updateProjectProgress(
      id,
      progress,
      context.req.user.sub,
    );
  }
}
