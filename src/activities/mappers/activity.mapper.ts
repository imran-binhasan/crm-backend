import { Activity } from '../entities/activity.entity';
import { User } from '../../users/entities/user.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { Company } from '../../companies/entities/company.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Deal } from '../../deals/entities/deal.entity';

export class ActivityMapper {
  static toDomain(prismaActivity: any): Activity {
    const activity = new Activity();
    
    activity.id = prismaActivity.id;
    activity.type = prismaActivity.type;
    activity.subject = prismaActivity.subject;
    activity.description = prismaActivity.description || undefined;
    activity.scheduledAt = prismaActivity.scheduledAt || undefined;
    activity.completedAt = prismaActivity.completedAt || undefined;
    activity.status = prismaActivity.status;
    activity.priority = prismaActivity.priority;
    
    // Related entity IDs
    activity.contactId = prismaActivity.contactId || undefined;
    activity.companyId = prismaActivity.companyId || undefined;
    activity.leadId = prismaActivity.leadId || undefined;
    activity.dealId = prismaActivity.dealId || undefined;
    activity.assignedToId = prismaActivity.assignedToId || undefined;
    
    // Timestamps
    activity.createdAt = prismaActivity.createdAt;
    activity.updatedAt = prismaActivity.updatedAt;
    activity.deletedAt = prismaActivity.deletedAt || undefined;
    activity.createdById = prismaActivity.createdById;
    
    // Relations - Create minimal objects
    if (prismaActivity.contact) {
      const contact = new Contact();
      contact.id = prismaActivity.contact.id;
      contact.firstName = prismaActivity.contact.firstName;
      contact.lastName = prismaActivity.contact.lastName;
      contact.email = prismaActivity.contact.email;
      activity.contact = contact;
    }
    
    if (prismaActivity.company) {
      const company = new Company();
      company.id = prismaActivity.company.id;
      company.name = prismaActivity.company.name;
      activity.company = company;
    }
    
    if (prismaActivity.lead) {
      const lead = new Lead();
      lead.id = prismaActivity.lead.id;
      lead.title = prismaActivity.lead.title;
      lead.status = prismaActivity.lead.status;
      activity.lead = lead;
    }
    
    if (prismaActivity.deal) {
      const deal = new Deal();
      deal.id = prismaActivity.deal.id;
      deal.title = prismaActivity.deal.title;
      deal.value = prismaActivity.deal.value;
      deal.stage = prismaActivity.deal.stage;
      activity.deal = deal;
    }
    
    if (prismaActivity.assignedTo) {
      const assignedTo = new User();
      assignedTo.id = prismaActivity.assignedTo.id;
      assignedTo.firstName = prismaActivity.assignedTo.firstName;
      assignedTo.lastName = prismaActivity.assignedTo.lastName;
      assignedTo.email = prismaActivity.assignedTo.email;
      activity.assignedTo = assignedTo;
    }
    
    if (prismaActivity.createdBy) {
      const createdBy = new User();
      createdBy.id = prismaActivity.createdBy.id;
      createdBy.firstName = prismaActivity.createdBy.firstName;
      createdBy.lastName = prismaActivity.createdBy.lastName;
      createdBy.email = prismaActivity.createdBy.email;
      activity.createdBy = createdBy;
    }
    
    return activity;
  }

  static toDomainArray(prismaActivities: any[]): Activity[] {
    return prismaActivities.map(activity => this.toDomain(activity));
  }
}
