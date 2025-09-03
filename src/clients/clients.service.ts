import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateClientInput } from './dto/create-client.input';
import { UpdateClientInput } from './dto/update-client.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { Client } from '@prisma/client';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(
    data: CreateClientInput,
    currentUserId: string,
  ): Promise<Client> {
    const canCreate = await this.rbacService.hasPermission(currentUserId, {
      resource: ResourceType.CLIENT,
      action: ActionType.CREATE,
    });
    if (!canCreate) {
      throw new ForbiddenException('Insufficient permissions to create client');
    }

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
      status: (data.status as any) || 'ACTIVE',
      createdById: currentUserId,
      paymentTerms: data.paymentTerms || 30,
    };

    return this.prisma.client.create({
      data: clientData as any,
      include: {
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
      },
    });
  }

  async findAll(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Client[]> {
    const hasPermission = await this.rbacService.hasPermission(currentUserId, {
      resource: ResourceType.CLIENT,
      action: ActionType.READ,
    });
    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions to access clients',
      );
    }

    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      ResourceType.CLIENT,
    );

    return this.prisma.client.findMany({
      where: { deletedAt: null, ...filters },
      include: {
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
      },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUserId: string): Promise<Client> {
    const client = await this.prisma.client.findUnique({
      where: { id, deletedAt: null },
      include: {
        company: true,
        primaryContact: true,
        accountManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const canRead = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.CLIENT, action: ActionType.READ },
      client,
    );
    if (!canRead) {
      throw new ForbiddenException(
        'Insufficient permissions to view this client',
      );
    }

    return client;
  }

  async update(
    id: string,
    data: UpdateClientInput,
    currentUserId: string,
  ): Promise<Client> {
    const existingClient = await this.prisma.client.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingClient) {
      throw new NotFoundException('Client not found');
    }

    const canUpdate = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.CLIENT, action: ActionType.UPDATE },
      existingClient,
    );
    if (!canUpdate) {
      throw new ForbiddenException(
        'Insufficient permissions to update this client',
      );
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

    return this.prisma.client.update({
      where: { id },
      data: updateData as any,
      include: {
        company: true,
        primaryContact: true,
        accountManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async remove(id: string, currentUserId: string): Promise<Client> {
    const existingClient = await this.prisma.client.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingClient) {
      throw new NotFoundException('Client not found');
    }

    const canDelete = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.CLIENT, action: ActionType.DELETE },
      existingClient,
    );
    if (!canDelete) {
      throw new ForbiddenException(
        'Insufficient permissions to delete this client',
      );
    }

    // Check if client has associated projects or invoices
    const projectCount = await this.prisma.project.count({
      where: { clientId: id, deletedAt: null },
    });

    if (projectCount > 0) {
      throw new BadRequestException(
        'Cannot delete client with associated projects. Please delete projects first.',
      );
    }

    return this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: {
        company: true,
        primaryContact: true,
        accountManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
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
