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
      client: createClientInput.name 
    });
    
    return this.clientsService.create(createClientInput, context.req.user.sub);
  }

  @Query(() => [Client], { name: 'clients' })
  async findAll(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Context() context?: any,
  ) {
    return this.clientsService.findAll(context.req.user.sub, take, skip);
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
      clientId: updateClientInput.id 
    });
    
    return this.clientsService.update(updateClientInput.id, updateClientInput, context.req.user.sub);
  }

  @Mutation(() => Client)
  async removeClient(
    @Args('id', { type: () => String }) id: string,
    @Context() context: any,
  ) {
    this.logger.log('GraphQL: Removing client', { 
      userId: context.req.user.sub,
      clientId: id 
    });
    
    return this.clientsService.remove(id, context.req.user.sub);
  }
}
