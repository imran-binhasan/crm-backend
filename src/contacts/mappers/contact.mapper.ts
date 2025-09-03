import { Injectable } from '@nestjs/common';
import { Contact as PrismaContact } from '@prisma/client';
import { Contact } from '../entities/contact.entity';

@Injectable()
export class ContactMapper {
  static toDomain(prismaContact: any): Contact {
    const contact = new Contact();
    
    // Base entity fields
    contact.id = prismaContact.id;
    contact.createdAt = prismaContact.createdAt;
    contact.updatedAt = prismaContact.updatedAt;
    contact.deletedAt = prismaContact.deletedAt;
    contact.createdById = prismaContact.createdById;
    
    // Contact specific fields
    contact.firstName = prismaContact.firstName;
    contact.lastName = prismaContact.lastName;
    contact.email = prismaContact.email;
    contact.phone = prismaContact.phone;
    contact.mobile = prismaContact.mobile;
    contact.jobTitle = prismaContact.jobTitle;
    contact.department = prismaContact.department;
    contact.companyId = prismaContact.companyId;
    contact.assignedToId = prismaContact.assignedToId;
    
    // Address fields
    contact.street = prismaContact.street;
    contact.city = prismaContact.city;
    contact.state = prismaContact.state;
    contact.zipCode = prismaContact.zipCode;
    contact.country = prismaContact.country;
    
    // Social media
    contact.linkedinUrl = prismaContact.linkedinUrl;
    contact.twitterUrl = prismaContact.twitterUrl;
    contact.websiteUrl = prismaContact.websiteUrl;
    
    // Status and source
    contact.status = prismaContact.status;
    contact.source = prismaContact.source;
    contact.isActive = prismaContact.isActive;
    
    // Relations
    if (prismaContact.assignedTo) {
      contact.assignedTo = prismaContact.assignedTo;
    }
    if (prismaContact.createdBy) {
      contact.createdBy = prismaContact.createdBy;
    }
    
    return contact;
  }

  static toDomainArray(prismaContacts: any[]): Contact[] {
    return prismaContacts.map(contact => this.toDomain(contact));
  }
}
