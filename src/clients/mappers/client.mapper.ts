import { Injectable } from '@nestjs/common';
import { Client as PrismaClient } from '@prisma/client';
import { Client } from '../entities/client.entity';

@Injectable()
export class ClientMapper {
  /**
   * Maps a Prisma Client entity to GraphQL Client entity
   */
  static toDomain(prismaClient: PrismaClient & {
    company?: any;
    primaryContact?: any;
    accountManager?: any;
    createdBy?: any;
  }): Client {
    const client = new Client();
    
    client.id = prismaClient.id;
    client.name = prismaClient.name;
    client.code = prismaClient.code ?? undefined;
    client.email = prismaClient.email ?? undefined;
    client.phone = prismaClient.phone ?? undefined;
    client.website = prismaClient.website ?? undefined;
    client.industry = prismaClient.industry ?? undefined;
    client.type = prismaClient.type as any;
    client.status = prismaClient.status as any;
    client.taxId = prismaClient.taxId ?? undefined;
    client.billingAddress = prismaClient.billingAddress ?? undefined;
    client.shippingAddress = prismaClient.shippingAddress ?? undefined;
    client.description = prismaClient.description ?? undefined;
    client.notes = prismaClient.notes ?? undefined;
    client.paymentTerms = prismaClient.paymentTerms;
    client.preferredCurrency = prismaClient.preferredCurrency ?? undefined;
    client.companyId = prismaClient.companyId ?? undefined;
    client.primaryContactId = prismaClient.primaryContactId ?? undefined;
    client.accountManagerId = prismaClient.accountManagerId ?? undefined;
    client.createdById = prismaClient.createdById;
    client.createdAt = prismaClient.createdAt;
    client.updatedAt = prismaClient.updatedAt;
    client.deletedAt = prismaClient.deletedAt ?? undefined;

    // Map relations
    if (prismaClient.company) {
      client.company = prismaClient.company;
    }
    
    if (prismaClient.primaryContact) {
      client.primaryContact = prismaClient.primaryContact;
    }
    
    if (prismaClient.accountManager) {
      client.accountManager = prismaClient.accountManager;
    }
    
    if (prismaClient.createdBy) {
      client.createdBy = prismaClient.createdBy;
    }

    return client;
  }

  /**
   * Maps multiple Prisma Client entities to GraphQL Client entities
   */
  static toDomainList(prismaClients: (PrismaClient & {
    company?: any;
    primaryContact?: any;
    accountManager?: any;
    createdBy?: any;
  })[]): Client[] {
    return prismaClients.map(client => this.toDomain(client));
  }
}
