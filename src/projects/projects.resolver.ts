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
      project: createProjectInput.name 
    });
    
    return this.projectsService.create(createProjectInput, context.req.user.sub);
  }

  @Query(() => [Project], { name: 'projects' })
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.projectsService.findAll(context.req.user.sub, take, skip);
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
      projectId: updateProjectInput.id 
    });
    
    return this.projectsService.update(updateProjectInput.id, updateProjectInput, context.req.user.sub);
  }

  @Mutation(() => Project)
  async removeProject(
    @Args('id', { type: () => String }) id: string,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Removing project', { 
      userId: context.req.user.sub,
      projectId: id 
    });
    
    return this.projectsService.remove(id, context.req.user.sub);
  }
}
