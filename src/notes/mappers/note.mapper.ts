import { Injectable } from '@nestjs/common';
import { Note } from '../entities/note.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { Company } from '../../companies/entities/company.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class NoteMapper {
  static toDomain(prismaNote: any): Note {
    if (!prismaNote) throw new Error('Cannot map null note to domain');

    const note = new Note();
    note.id = prismaNote.id;
    note.content = prismaNote.content;
    note.isPrivate = prismaNote.isPrivate;
    note.contactId = prismaNote.contactId;
    note.companyId = prismaNote.companyId;
    note.leadId = prismaNote.leadId;
    note.dealId = prismaNote.dealId;
    note.createdById = prismaNote.createdById;
    note.createdAt = prismaNote.createdAt;
    note.updatedAt = prismaNote.updatedAt;
    note.deletedAt = prismaNote.deletedAt;

    // Map related entities
    if (prismaNote.contact) {
      const contact = new Contact();
      contact.id = prismaNote.contact.id;
      contact.firstName = prismaNote.contact.firstName;
      contact.lastName = prismaNote.contact.lastName;
      contact.email = prismaNote.contact.email;
      note.contact = contact;
    }

    if (prismaNote.company) {
      const company = new Company();
      company.id = prismaNote.company.id;
      company.name = prismaNote.company.name;
      note.company = company;
    }
    
    if (prismaNote.lead) {
      const lead = new Lead();
      lead.id = prismaNote.lead.id;
      lead.title = prismaNote.lead.title;
      lead.status = prismaNote.lead.status;
      note.lead = lead;
    }
    
    if (prismaNote.deal) {
      const deal = new Deal();
      deal.id = prismaNote.deal.id;
      deal.title = prismaNote.deal.title;
      deal.value = prismaNote.deal.value;
      deal.stage = prismaNote.deal.stage;
      note.deal = deal;
    }

    if (prismaNote.createdBy) {
      const createdBy = new User();
      createdBy.id = prismaNote.createdBy.id;
      createdBy.firstName = prismaNote.createdBy.firstName;
      createdBy.lastName = prismaNote.createdBy.lastName;
      createdBy.email = prismaNote.createdBy.email;
      note.createdBy = createdBy;
    }

    return note;
  }
}
