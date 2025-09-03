import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { BaseService } from '../common/services/base.service';
import { CreateContactInput } from './dto/create-contact.input';
import { UpdateContactInput } from './dto/update-contact.input';
import { ResourceType } from '../common/rbac/permission.types';
import { Contact } from './entities/contact.entity';
import { ContactMapper } from './mappers/contact.mapper';

@Injectable()
export class ContactsService extends BaseService<
  Contact,
  CreateContactInput,
  UpdateContactInput
> {
  protected readonly resourceType = ResourceType.CONTACT;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly rbacService: RbacService,
  ) {
    super(prisma, rbacService, 'ContactsService');
  }

  // Implementation of abstract methods from BaseService
  protected async performCreate(data: CreateContactInput, currentUserId: string): Promise<Contact> {
    await this.validateCreateInput(data, currentUserId);

    const contact = await this.prisma.contact.create({
      data: {
        ...data,
        createdById: currentUserId,
        status: data.status || 'ACTIVE',
      },
      include: this.getIncludeOptions(),
    });

    return ContactMapper.toDomain(contact);
  }

  protected async performFindMany(options: any): Promise<Contact[]> {
    const contacts = await this.prisma.contact.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });

    return ContactMapper.toDomainArray(contacts);
  }

  protected async performFindUnique(id: string): Promise<Contact | null> {
    const contact = await this.prisma.contact.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeOptions(),
    });

    return contact ? ContactMapper.toDomain(contact) : null;
  }

  protected async performUpdate(
    id: string,
    data: UpdateContactInput,
    currentUserId: string,
  ): Promise<Contact> {
    await this.validateUpdateInput(id, data, currentUserId);

    const { id: _, ...updateData } = data;

    const contact = await this.prisma.contact.update({
      where: { id },
      data: updateData,
      include: this.getIncludeOptions(),
    });

    return ContactMapper.toDomain(contact);
  }

  protected async performDelete(id: string): Promise<Contact> {
    const contact = await this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.getIncludeOptions(),
    });

    return ContactMapper.toDomain(contact);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    await this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.contact.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.contact.count(options);
  }

  protected async buildWhereClause(filters: any, currentUserId: string): Promise<any> {
    const baseWhere = { deletedAt: null };
    const permissionFilters = await this.rbacService.getPermissionFilters(
      currentUserId,
      this.resourceType,
    );

    return {
      ...baseWhere,
      ...permissionFilters,
      ...filters,
    };
  }

  protected buildOrderBy(pagination: any): any {
    return pagination?.orderBy || this.getDefaultOrderBy();
  }

  // Helper methods
  private getIncludeOptions() {
    return {
      company: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    };
  }

  private async validateCreateInput(
    data: CreateContactInput,
    currentUserId: string,
  ): Promise<void> {
    // Validate required fields
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      throw new BadRequestException('First name and last name are required');
    }

    // Validate company if provided
    if (data.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: data.companyId, deletedAt: null },
      });
      if (!company) {
        throw new BadRequestException('Invalid company ID provided');
      }
    }

    // Validate assigned user if provided
    if (data.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: data.assignedToId, isActive: true },
      });
      if (!user) {
        throw new BadRequestException('Invalid assigned user ID provided');
      }
    }

    // Validate email uniqueness if provided
    if (data.email) {
      const existingContact = await this.prisma.contact.findFirst({
        where: {
          email: data.email,
          deletedAt: null,
        },
      });
      if (existingContact) {
        throw new BadRequestException('Contact with this email already exists');
      }
    }
  }

  private async validateUpdateInput(
    id: string,
    data: UpdateContactInput,
    currentUserId: string,
  ): Promise<void> {
    const existingContact = await this.prisma.contact.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingContact) {
      throw new NotFoundException('Contact not found');
    }

    // Validate company if provided and changed
    if (data.companyId && data.companyId !== existingContact.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: data.companyId, deletedAt: null },
      });
      if (!company) {
        throw new BadRequestException('Invalid company ID provided');
      }
    }

    // Validate assigned user if provided and changed
    if (data.assignedToId && data.assignedToId !== existingContact.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: data.assignedToId, isActive: true },
      });
      if (!user) {
        throw new BadRequestException('Invalid assigned user ID provided');
      }
    }

    // Validate email uniqueness if provided and changed
    if (data.email && data.email !== existingContact.email) {
      const existingContactWithEmail = await this.prisma.contact.findFirst({
        where: {
          email: data.email,
          deletedAt: null,
          id: { not: id },
        },
      });
      if (existingContactWithEmail) {
        throw new BadRequestException('Contact with this email already exists');
      }
    }
  }

  private getDefaultOrderBy() {
    return { lastName: 'asc' as const, firstName: 'asc' as const };
  }

  // Business logic methods
  /**
   * Assign contact to a user
   */
  async assignToUser(
    contactId: string,
    userId: string,
    currentUserId: string,
  ): Promise<Contact> {
    try {
      // Check if contact exists
      const existingContact = await this.findOne(contactId, currentUserId);

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId, isActive: true },
      });

      if (!user) {
        throw new BadRequestException('Invalid user ID provided');
      }

      // Update contact
      const updatedContact = await this.update(
        contactId,
        { id: contactId, assignedToId: userId },
        currentUserId,
      );

      this.logger.log(
        `Contact assigned: ${existingContact.firstName} ${existingContact.lastName} to ${user.firstName} ${user.lastName}`,
      );

      return updatedContact;
    } catch (error) {
      this.logger.error(`Failed to assign contact: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find contacts by company
   */
  async findByCompany(
    companyId: string,
    currentUserId: string,
    pagination?: { take?: number; skip?: number },
  ): Promise<Contact[]> {
    const filters = await this.buildWhereClause(
      { companyId },
      currentUserId,
    );
    
    const contacts = await this.prisma.contact.findMany({
      where: filters,
      include: this.getIncludeOptions(),
      take: pagination?.take,
      skip: pagination?.skip,
      orderBy: this.getDefaultOrderBy(),
    });

    return ContactMapper.toDomainArray(contacts);
  }

  /**
   * Find contacts by assigned user
   */
  async findByAssignedUser(
    assignedToId: string,
    currentUserId: string,
    pagination?: { take?: number; skip?: number },
  ): Promise<Contact[]> {
    const filters = await this.buildWhereClause(
      { assignedToId },
      currentUserId,
    );
    
    const contacts = await this.prisma.contact.findMany({
      where: filters,
      include: this.getIncludeOptions(),
      take: pagination?.take,
      skip: pagination?.skip,
      orderBy: this.getDefaultOrderBy(),
    });

    return ContactMapper.toDomainArray(contacts);
  }
}
