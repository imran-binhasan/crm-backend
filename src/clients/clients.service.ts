import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateClientInput } from './dto/create-client.input';
import { UpdateClientInput } from './dto/update-client.input';
import { Client } from './entities/client.entity';
import { ClientMapper } from './mappers/client.mapper';
import { ResourceType } from '../common/rbac/permission.types';

@Injectable()
export class ClientsService extends BaseService<
  Client,
  CreateClientInput,
  UpdateClientInput
> {
  protected readonly resourceType = ResourceType.CLIENT;

  constructor(
    prisma: PrismaService,
    rbacService: RbacService,
  ) {
    super(prisma, rbacService, ClientsService.name);
  }

  protected mapToDomain(prismaEntity: any): Client {
    return ClientMapper.toDomain(prismaEntity);
  }

  protected async performCreate(data: CreateClientInput, currentUserId: string): Promise<Client> {
    // Check for duplicate client name
    if (data.name) {
      const existingClient = await this.prisma.client.findFirst({
        where: { name: data.name, deletedAt: null },
      });
      if (existingClient) {
        throw new BadRequestException('A client with this name already exists');
      }
    }

    // Generate client code if not provided
    const clientCode = data.code || (await this.generateClientCode());

    const clientData = {
      ...data,
      code: clientCode,
      type: data.type as any,
      status: data.status as any || 'ACTIVE',
      createdById: currentUserId,
      paymentTerms: data.paymentTerms || 30,
    };

    const result = await this.prisma.client.create({
      data: clientData as any,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  protected async performFindMany(options: any): Promise<Client[]> {
    const result = await this.prisma.client.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });

    return result.map(client => this.mapToDomain(client));
  }

  protected async performFindUnique(id: string): Promise<Client | null> {
    const result = await this.prisma.client.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeOptions(),
    });

    return result ? this.mapToDomain(result) : null;
  }

  protected async performUpdate(id: string, data: UpdateClientInput, currentUserId: string): Promise<Client> {
    // Get existing client
    const existingClient = await this.prisma.client.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingClient) {
      throw new BadRequestException('Client not found');
    }

    // Check for duplicate name if name is being changed
    if (data.name && data.name !== existingClient.name) {
      const duplicate = await this.prisma.client.findFirst({
        where: { name: data.name, id: { not: id }, deletedAt: null },
      });
      if (duplicate) {
        throw new BadRequestException('A client with this name already exists');
      }
    }

    const { id: _, ...updateData } = data;

    const result = await this.prisma.client.update({
      where: { id },
      data: updateData as any,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    // Check if client has associated projects or invoices
    const projectCount = await this.prisma.project.count({
      where: { clientId: id, deletedAt: null },
    });

    if (projectCount > 0) {
      throw new BadRequestException(
        'Cannot delete client with associated projects. Please delete projects first.',
      );
    }

    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.client.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.client.count(options);
  }

  private getIncludeOptions() {
    return {
      company: { select: { id: true, name: true } },
      primaryContact: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      accountManager: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    };
  }

  // Business methods
  async getClientsByType(
    type: string,
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Client[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const clients = await this.prisma.client.findMany({
      where: { 
        type: type as any,
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { name: 'asc' },
    });

    return clients.map(client => this.mapToDomain(client));
  }

  async getClientsByStatus(
    status: string,
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Client[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const clients = await this.prisma.client.findMany({
      where: { 
        status: status as any,
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { name: 'asc' },
    });

    return clients.map(client => this.mapToDomain(client));
  }

  async getActiveClients(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Client[]> {
    return this.getClientsByStatus('ACTIVE', currentUserId, take, skip);
  }

  async getClientsByAccountManager(
    accountManagerId: string,
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Client[]> {
    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    const clients = await this.prisma.client.findMany({
      where: { 
        accountManagerId,
        deletedAt: null,
        ...filters,
      },
      include: this.getIncludeOptions(),
      take,
      skip,
      orderBy: { name: 'asc' },
    });

    return clients.map(client => this.mapToDomain(client));
  }

  async updateClientStatus(
    id: string,
    status: string,
    currentUserId: string,
  ): Promise<Client> {
    const client = await this.prisma.client.update({
      where: { id },
      data: { status: status as any },
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(client);
  }

  private async generateClientCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const lastClient = await this.prisma.client.findFirst({
      where: { code: { startsWith: `CL${year}` } },
      orderBy: { code: 'desc' },
    });

    let nextNumber = 1;
    if (lastClient?.code) {
      const lastNumber = parseInt(lastClient.code.slice(4));
      nextNumber = lastNumber + 1;
    }

    return `CL${year}${nextNumber.toString().padStart(4, '0')}`;
  }
}
