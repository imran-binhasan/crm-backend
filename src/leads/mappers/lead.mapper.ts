import { Injectable } from '@nestjs/common';
import { Lead as PrismaLead } from '@prisma/client';
import { Lead } from '../entities/lead.entity';

@Injectable()
export class LeadMapper {
  static toDomain(prismaLead: any): Lead {
    const lead = new Lead();
    
    // Base entity fields
    lead.id = prismaLead.id;
    lead.createdAt = prismaLead.createdAt;
    lead.updatedAt = prismaLead.updatedAt;
    lead.deletedAt = prismaLead.deletedAt;
    lead.createdById = prismaLead.createdById;
    
    // Lead specific fields
    lead.title = prismaLead.title;
    lead.contactId = prismaLead.contactId;
    lead.companyId = prismaLead.companyId;
    lead.assignedToId = prismaLead.assignedToId;
    lead.value = prismaLead.value;
    lead.source = prismaLead.source;
    lead.status = prismaLead.status;
    lead.priority = prismaLead.priority;
    lead.expectedCloseDate = prismaLead.expectedCloseDate;
    lead.description = prismaLead.description;
    lead.isActive = prismaLead.isActive;
    
    // Relations
    if (prismaLead.assignedTo) {
      lead.assignedTo = prismaLead.assignedTo;
    }
    if (prismaLead.createdBy) {
      lead.createdBy = prismaLead.createdBy;
    }
    
    return lead;
  }

  static toDomainArray(prismaLeads: any[]): Lead[] {
    return prismaLeads.map(lead => this.toDomain(lead));
  }
}
