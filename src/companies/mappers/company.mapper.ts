import { Company as PrismaCompany } from '@prisma/client';
import { Company } from '../entities/company.entity';
import { User } from '../../users/entities/user.entity';

export class CompanyMapper {
  static toDomain(prismaCompany: any): Company {
    const company = new Company();
    
    company.id = prismaCompany.id;
    company.name = prismaCompany.name;
    company.industry = prismaCompany.industry || undefined;
    company.size = prismaCompany.size || undefined;
    company.revenue = prismaCompany.revenue ? Number(prismaCompany.revenue) : undefined;
    company.website = prismaCompany.website || undefined;
    company.phone = prismaCompany.phone || undefined;
    company.email = prismaCompany.email || undefined;
    company.assignedToId = prismaCompany.assignedToId || undefined;
    
    // Address fields
    company.street = prismaCompany.street || undefined;
    company.city = prismaCompany.city || undefined;
    company.state = prismaCompany.state || undefined;
    company.zipCode = prismaCompany.zipCode || undefined;
    company.country = prismaCompany.country || undefined;
    
    // Social media
    company.linkedinUrl = prismaCompany.linkedinUrl || undefined;
    company.twitterUrl = prismaCompany.twitterUrl || undefined;
    
    // Status and flags
    company.status = prismaCompany.status;
    company.isActive = prismaCompany.isActive;
    
    // Timestamps
    company.createdAt = prismaCompany.createdAt;
    company.updatedAt = prismaCompany.updatedAt;
    company.deletedAt = prismaCompany.deletedAt || undefined;
    company.createdById = prismaCompany.createdById;
    
    // Relations - Create minimal User objects
    if (prismaCompany.assignedTo) {
      const assignedTo = new User();
      assignedTo.id = prismaCompany.assignedTo.id;
      assignedTo.firstName = prismaCompany.assignedTo.firstName;
      assignedTo.lastName = prismaCompany.assignedTo.lastName;
      assignedTo.email = prismaCompany.assignedTo.email;
      company.assignedTo = assignedTo;
    }
    
    if (prismaCompany.createdBy) {
      const createdBy = new User();
      createdBy.id = prismaCompany.createdBy.id;
      createdBy.firstName = prismaCompany.createdBy.firstName;
      createdBy.lastName = prismaCompany.createdBy.lastName;
      createdBy.email = prismaCompany.createdBy.email;
      company.createdBy = createdBy;
    }
    
    return company;
  }

  static toDomainArray(prismaCompanies: any[]): Company[] {
    return prismaCompanies.map(company => this.toDomain(company));
  }
}
