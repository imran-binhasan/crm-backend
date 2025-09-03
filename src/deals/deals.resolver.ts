import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { DealsService } from './deals.service';
import { Deal } from './entities/deal.entity';
import { CreateDealInput } from './dto/create-deal.input';
import { UpdateDealInput } from './dto/update-deal.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => Deal)
@UseGuards(JwtAuthGuard)
export class DealsResolver {
  private readonly logger = new Logger(DealsResolver.name);

  constructor(private readonly dealsService: DealsService) {}

  @Mutation(() => Deal)
  async createDeal(
    @Args('createDealInput') createDealInput: CreateDealInput,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Creating deal', {
      userId: context.req.user.sub,
      deal: createDealInput.title,
    });

    return this.dealsService.create(createDealInput, context.req.user.sub);
  }

  @Query(() => [Deal], { name: 'deals' })
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.dealsService.findAll(context.req.user.sub, take, skip);
  }

  @Query(() => Deal, { name: 'deal' })
  async findOne(
    @Args('id', { type: () => String }) id: string,
    @Context() context: any,
  ) {
    return this.dealsService.findOne(id, context.req.user.sub);
  }

  @Mutation(() => Deal)
  async updateDeal(
    @Args('updateDealInput') updateDealInput: UpdateDealInput,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Updating deal', {
      userId: context.req.user.sub,
      dealId: updateDealInput.id,
    });

    return this.dealsService.update(
      updateDealInput.id,
      updateDealInput,
      context.req.user.sub,
    );
  }

  @Mutation(() => Deal)
  async removeDeal(
    @Args('id', { type: () => String }) id: string,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Removing deal', {
      userId: context.req.user.sub,
      dealId: id,
    });

    return this.dealsService.remove(id, context.req.user.sub);
  }
}
