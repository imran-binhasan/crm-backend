import { Injectable } from '@nestjs/common';
import { Deal as PrismaDeal } from '@prisma/client';
import { Deal } from '../entities/deal.entity';

@Injectable()
export class DealMapper {
  static toDomain(prismaDeal: any): Deal {
    const deal = new Deal();
    
    // Base entity fields
    deal.id = prismaDeal.id;
    deal.createdAt = prismaDeal.createdAt;
    deal.updatedAt = prismaDeal.updatedAt;
    deal.deletedAt = prismaDeal.deletedAt;
    deal.createdById = prismaDeal.createdById;
    
    // Deal specific fields
    deal.title = prismaDeal.title;
    deal.contactId = prismaDeal.contactId;
    deal.companyId = prismaDeal.companyId;
    deal.leadId = prismaDeal.leadId;
    deal.assignedToId = prismaDeal.assignedToId;
    deal.value = prismaDeal.value;
    deal.stage = prismaDeal.stage;
    deal.probability = prismaDeal.probability;
    deal.priority = prismaDeal.priority;
    deal.expectedCloseDate = prismaDeal.expectedCloseDate;
    deal.actualCloseDate = prismaDeal.actualCloseDate;
    deal.description = prismaDeal.description;
    deal.isActive = prismaDeal.isActive;
    
    // Relations
    if (prismaDeal.assignedTo) {
      deal.assignedTo = prismaDeal.assignedTo;
    }
    if (prismaDeal.createdBy) {
      deal.createdBy = prismaDeal.createdBy;
    }
    
    return deal;
  }

  static toDomainArray(prismaDeals: any[]): Deal[] {
    return prismaDeals.map(deal => this.toDomain(deal));
  }
}
