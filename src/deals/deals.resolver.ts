import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { DealsService } from './deals.service';
import { Deal } from './entities/deal.entity';
import { CreateDealInput } from './dto/create-deal.input';
import { UpdateDealInput } from './dto/update-deal.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';

@Resolver(() => Deal)
@UseGuards(JwtAuthGuard, RbacGuard)
export class DealsResolver {
  private readonly logger = new Logger(DealsResolver.name);

  constructor(private readonly dealsService: DealsService) {}

  @Mutation(() => Deal)
  @RequirePermissions({ resource: ResourceType.DEAL, action: ActionType.CREATE })
  async createDeal(
    @Args('createDealInput') createDealInput: CreateDealInput,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Creating deal', { 
      userId: context.req.user.sub,
      deal: createDealInput.title 
    });
    
    return this.dealsService.create(createDealInput, context.req.user.sub);
  }

  @Query(() => [Deal], { name: 'deals' })
  @RequirePermissions({ resource: ResourceType.DEAL, action: ActionType.READ })
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.dealsService.findAll(context.req.user.sub, take, skip);
  }

  @Query(() => Deal, { name: 'deal' })
  @RequirePermissions({ resource: ResourceType.DEAL, action: ActionType.READ })
  async findOne(
    @Args('id', { type: () => String }) id: string,
    @Context() context: any,
  ) {
    return this.dealsService.findOne(id, context.req.user.sub);
  }

  @Mutation(() => Deal)
  @RequirePermissions({ resource: ResourceType.DEAL, action: ActionType.UPDATE })
  async updateDeal(
    @Args('updateDealInput') updateDealInput: UpdateDealInput,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Updating deal', { 
      userId: context.req.user.sub,
      dealId: updateDealInput.id 
    });
    
    return this.dealsService.update(updateDealInput.id, updateDealInput, context.req.user.sub);
  }

  @Mutation(() => Deal)
  @RequirePermissions({ resource: ResourceType.DEAL, action: ActionType.DELETE })
  async removeDeal(
    @Args('id', { type: () => String }) id: string,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Removing deal', { 
      userId: context.req.user.sub,
      dealId: id 
    });
    
    return this.dealsService.remove(id, context.req.user.sub);
  }
}
