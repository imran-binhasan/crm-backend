import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { CreateClientInput } from './dto/create-client.input';
import { UpdateClientInput } from './dto/update-client.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => Client)
@UseGuards(JwtAuthGuard)
export class ClientsResolver {
  private readonly logger = new Logger(ClientsResolver.name);

  constructor(private readonly clientsService: ClientsService) {}

  @Mutation(() => Client)
  async createClient(
    @Args('createClientInput') createClientInput: CreateClientInput,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Creating client', {
      userId: context.req.user.sub,
      client: createClientInput.name,
    });

    return this.clientsService.create(createClientInput, context.req.user.sub);
  }

  @Query(() => [Client], { name: 'clients' })
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    const pagination = take ? { page: Math.floor((skip || 0) / take) + 1, limit: take } : undefined;
    const result = await this.clientsService.findAll(context.req.user.sub, pagination);
    return result.data;
  }

  @Query(() => Client, { name: 'client' })
  async findOne(
    @Args('id', { type: () => String }) id: string,
    @Context() context: any,
  ) {
    return this.clientsService.findOne(id, context.req.user.sub);
  }

  @Mutation(() => Client)
  async updateClient(
    @Args('updateClientInput') updateClientInput: UpdateClientInput,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Updating client', {
      userId: context.req.user.sub,
      clientId: updateClientInput.id,
    });

    return this.clientsService.update(
      updateClientInput.id,
      updateClientInput,
      context.req.user.sub,
    );
  }

  @Mutation(() => Boolean)
  async removeClient(
    @Args('id', { type: () => String }) id: string,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Removing client', {
      userId: context.req.user.sub,
      clientId: id,
    });

    await this.clientsService.remove(id, context.req.user.sub);
    return true;
  }

  // Business query methods
  @Query(() => [Client])
  async clientsByType(
    @Args('type', { type: () => String }) type: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.clientsService.getClientsByType(
      type,
      context.req.user.sub,
      take,
      skip,
    );
  }

  @Query(() => [Client])
  async clientsByStatus(
    @Args('status', { type: () => String }) status: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.clientsService.getClientsByStatus(
      status,
      context.req.user.sub,
      take,
      skip,
    );
  }

  @Query(() => [Client])
  async activeClients(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.clientsService.getActiveClients(
      context.req.user.sub,
      take,
      skip,
    );
  }

  @Query(() => [Client])
  async clientsByAccountManager(
    @Args('accountManagerId', { type: () => String }) accountManagerId: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.clientsService.getClientsByAccountManager(
      accountManagerId,
      context.req.user.sub,
      take,
      skip,
    );
  }

  // Business mutation methods
  @Mutation(() => Client)
  async updateClientStatus(
    @Args('id', { type: () => String }) id: string,
    @Args('status', { type: () => String }) status: string,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Updating client status', {
      userId: context.req.user.sub,
      clientId: id,
      status,
    });

    return this.clientsService.updateClientStatus(
      id,
      status,
      context.req.user.sub,
    );
  }
}
