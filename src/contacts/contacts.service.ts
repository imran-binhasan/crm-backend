import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateContactInput } from './dto/create-contact.input';
import { UpdateContactInput } from './dto/update-contact.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { Contact, Prisma } from '@prisma/client';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(data: CreateContactInput, currentUserId: string): Promise<Contact> {
    try {
      this.logger.log('Creating contact', { currentUserId, data: { firstName: data.firstName, lastName: data.lastName } });

      // Check permissions
      const canCreate = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.CONTACT, action: ActionType.CREATE }
      );
      if (!canCreate) {
        throw new ForbiddenException('Insufficient permissions to create contact');
      }

      // Validate input
      if (!data.firstName || !data.lastName) {
        throw new BadRequestException('First name and last name are required');
      }

      // Check if company exists (if provided)
      if (data.companyId) {
        const companyExists = await this.prisma.company.findUnique({
          where: { id: data.companyId, deletedAt: null }
        });
        if (!companyExists) {
          throw new BadRequestException('Invalid company ID provided');
        }
      }

      // Check if assigned user exists (if provided)
      if (data.assignedToId) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: data.assignedToId, isActive: true }
        });
        if (!userExists) {
          throw new BadRequestException('Invalid assigned user ID provided');
        }
      }

      const contact = await this.prisma.contact.create({
        data: {
          ...data,
          createdById: currentUserId,
          status: (data.status as any) || 'ACTIVE',
        },
        include: {
          company: true,
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      this.logger.log(`Contact created: ${contact.firstName} ${contact.lastName}`);
      return contact;

    } catch (error) {
      this.logger.error(`Failed to create contact: ${error.message}`);
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to create contact');
    }
  }

  async findAll(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Contact[]> {
    try {
      this.logger.log('Finding all contacts', { currentUserId, take, skip });

      // Check permissions
      const hasPermission = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.CONTACT, action: ActionType.READ }
      );

      if (!hasPermission) {
        throw new ForbiddenException('Insufficient permissions to access contacts');
      }

      // Get permission filters
      const filters = await this.rbacService.getPermissionFilters(
        currentUserId,
        ResourceType.CONTACT
      );

      const contacts = await this.prisma.contact.findMany({
        where: {
          deletedAt: null,
          ...filters,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log('Successfully retrieved contacts', { count: contacts.length });
      return contacts;

    } catch (error) {
      this.logger.error('Error finding contacts', { error: error.message, currentUserId });
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve contacts');
    }
  }

  async findOne(id: string, currentUserId: string): Promise<Contact> {
    try {
      const contact = await this.prisma.contact.findUnique({
        where: { id, deletedAt: null },
        include: {
          company: true,
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }

      // Check permissions
      const canRead = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.CONTACT, action: ActionType.READ },
        contact
      );

      if (!canRead) {
        throw new ForbiddenException('Insufficient permissions to view this contact');
      }

      return contact;

    } catch (error) {
      this.logger.error(`Failed to find contact: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve contact');
    }
  }

  async update(id: string, data: UpdateContactInput, currentUserId: string): Promise<Contact> {
    try {
      // Check if contact exists
      const existingContact = await this.prisma.contact.findUnique({
        where: { id, deletedAt: null }
      });

      if (!existingContact) {
        throw new NotFoundException('Contact not found');
      }

      // Check permissions
      const canUpdate = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.CONTACT, action: ActionType.UPDATE },
        existingContact
      );

      if (!canUpdate) {
        throw new ForbiddenException('Insufficient permissions to update this contact');
      }

      // Validate company if provided
      if (data.companyId && data.companyId !== existingContact.companyId) {
        const companyExists = await this.prisma.company.findUnique({
          where: { id: data.companyId, deletedAt: null }
        });
        if (!companyExists) {
          throw new BadRequestException('Invalid company ID provided');
        }
      }

      // Validate assigned user if provided
      if (data.assignedToId && data.assignedToId !== existingContact.assignedToId) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: data.assignedToId, isActive: true }
        });
        if (!userExists) {
          throw new BadRequestException('Invalid assigned user ID provided');
        }
      }

      const { id: _, ...updateData } = data;

      const contact = await this.prisma.contact.update({
        where: { id },
        data: updateData as any,
        include: {
          company: true,
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      this.logger.log(`Contact updated: ${contact.firstName} ${contact.lastName}`);
      return contact;

    } catch (error) {
      this.logger.error(`Failed to update contact: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update contact');
    }
  }

  async remove(id: string, currentUserId: string): Promise<Contact> {
    try {
      // Check if contact exists
      const existingContact = await this.prisma.contact.findUnique({
        where: { id, deletedAt: null }
      });

      if (!existingContact) {
        throw new NotFoundException('Contact not found');
      }

      // Check permissions
      const canDelete = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.CONTACT, action: ActionType.DELETE },
        existingContact
      );

      if (!canDelete) {
        throw new ForbiddenException('Insufficient permissions to delete this contact');
      }

      // Soft delete
      const contact = await this.prisma.contact.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: {
          company: true,
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      this.logger.log(`Contact deleted: ${contact.firstName} ${contact.lastName}`);
      return contact;

    } catch (error) {
      this.logger.error(`Failed to delete contact: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete contact');
    }
  }

  async assignToUser(contactId: string, userId: string, currentUserId: string): Promise<Contact> {
    try {
      // Check if contact exists
      const existingContact = await this.prisma.contact.findUnique({
        where: { id: contactId, deletedAt: null }
      });

      if (!existingContact) {
        throw new NotFoundException('Contact not found');
      }

      // Check permissions
      const canAssign = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.CONTACT, action: ActionType.ASSIGN }
      );

      if (!canAssign) {
        throw new ForbiddenException('Insufficient permissions to assign contacts');
      }

      // Check if user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId, isActive: true }
      });

      if (!userExists) {
        throw new BadRequestException('Invalid user ID provided');
      }

      const contact = await this.prisma.contact.update({
        where: { id: contactId },
        data: { assignedToId: userId },
        include: {
          company: true,
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      this.logger.log(`Contact assigned: ${contact.firstName} ${contact.lastName} to ${userExists.firstName} ${userExists.lastName}`);
      return contact;

    } catch (error) {
      this.logger.error(`Failed to assign contact: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to assign contact');
    }
  }
}
