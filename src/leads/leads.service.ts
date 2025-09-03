import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateLeadInput } from './dto/create-lead.input';
import { UpdateLeadInput } from './dto/update-lead.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { Lead } from '@prisma/client';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(data: CreateLeadInput, currentUserId: string): Promise<Lead> {
    try {
      this.logger.log('Creating lead', {
        currentUserId,
        data: { title: data.title },
      });

      // Check permissions
      const canCreate = await this.rbacService.hasPermission(currentUserId, {
        resource: ResourceType.LEAD,
        action: ActionType.CREATE,
      });
      if (!canCreate) {
        throw new ForbiddenException('Insufficient permissions to create lead');
      }

      // Validate input
      if (!data.title) {
        throw new BadRequestException('Lead title is required');
      }

      // Validate contact if provided
      if (data.contactId) {
        const contactExists = await this.prisma.contact.findUnique({
          where: { id: data.contactId, deletedAt: null },
        });
        if (!contactExists) {
          throw new BadRequestException('Invalid contact ID provided');
        }
      }

      // Validate company if provided
      if (data.companyId) {
        const companyExists = await this.prisma.company.findUnique({
          where: { id: data.companyId, deletedAt: null },
        });
        if (!companyExists) {
          throw new BadRequestException('Invalid company ID provided');
        }
      }

      // Validate assigned user if provided
      if (data.assignedToId) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: data.assignedToId, isActive: true },
        });
        if (!userExists) {
          throw new BadRequestException('Invalid assigned user ID provided');
        }
      }

      const leadData = {
        ...data,
        createdById: currentUserId,
        status: (data.status as any) || 'NEW',
        priority: (data.priority as any) || 'MEDIUM',
        expectedCloseDate: data.expectedCloseDate
          ? new Date(data.expectedCloseDate)
          : null,
      };

      const lead = await this.prisma.lead.create({
        data: leadData as any,
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
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
        },
      });

      this.logger.log(`Lead created: ${lead.title}`);
      return lead;
    } catch (error) {
      this.logger.error(`Failed to create lead: ${error.message}`);
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create lead');
    }
  }

  async findAll(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Lead[]> {
    try {
      this.logger.log('Finding all leads', { currentUserId, take, skip });

      // Check permissions
      const hasPermission = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.LEAD, action: ActionType.READ },
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          'Insufficient permissions to access leads',
        );
      }

      // Get permission filters
      const filters = await this.rbacService.getPermissionFilters(
        currentUserId,
        ResourceType.LEAD,
      );

      const leads = await this.prisma.lead.findMany({
        where: {
          deletedAt: null,
          ...filters,
        },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
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
        },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log('Successfully retrieved leads', { count: leads.length });
      return leads;
    } catch (error) {
      this.logger.error('Error finding leads', {
        error: error.message,
        currentUserId,
      });
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve leads');
    }
  }

  async findOne(id: string, currentUserId: string): Promise<Lead> {
    try {
      const lead = await this.prisma.lead.findUnique({
        where: { id, deletedAt: null },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
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
        },
      });

      if (!lead) {
        throw new NotFoundException('Lead not found');
      }

      // Check permissions
      const canRead = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.LEAD, action: ActionType.READ },
        lead,
      );

      if (!canRead) {
        throw new ForbiddenException(
          'Insufficient permissions to view this lead',
        );
      }

      return lead;
    } catch (error) {
      this.logger.error(`Failed to find lead: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve lead');
    }
  }

  async update(
    id: string,
    data: UpdateLeadInput,
    currentUserId: string,
  ): Promise<Lead> {
    try {
      // Check if lead exists
      const existingLead = await this.prisma.lead.findUnique({
        where: { id, deletedAt: null },
      });

      if (!existingLead) {
        throw new NotFoundException('Lead not found');
      }

      // Check permissions
      const canUpdate = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.LEAD, action: ActionType.UPDATE },
        existingLead,
      );

      if (!canUpdate) {
        throw new ForbiddenException(
          'Insufficient permissions to update this lead',
        );
      }

      // Validate contact if provided
      if (data.contactId && data.contactId !== existingLead.contactId) {
        const contactExists = await this.prisma.contact.findUnique({
          where: { id: data.contactId, deletedAt: null },
        });
        if (!contactExists) {
          throw new BadRequestException('Invalid contact ID provided');
        }
      }

      // Validate company if provided
      if (data.companyId && data.companyId !== existingLead.companyId) {
        const companyExists = await this.prisma.company.findUnique({
          where: { id: data.companyId, deletedAt: null },
        });
        if (!companyExists) {
          throw new BadRequestException('Invalid company ID provided');
        }
      }

      // Validate assigned user if provided
      if (
        data.assignedToId &&
        data.assignedToId !== existingLead.assignedToId
      ) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: data.assignedToId, isActive: true },
        });
        if (!userExists) {
          throw new BadRequestException('Invalid assigned user ID provided');
        }
      }

      const { id: _, ...updateData } = data;

      // Handle date conversion
      const processedData = {
        ...updateData,
        expectedCloseDate: data.expectedCloseDate
          ? new Date(data.expectedCloseDate)
          : updateData.expectedCloseDate,
      };

      const lead = await this.prisma.lead.update({
        where: { id },
        data: processedData as any,
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
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
        },
      });

      this.logger.log(`Lead updated: ${lead.title}`);
      return lead;
    } catch (error) {
      this.logger.error(`Failed to update lead: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update lead');
    }
  }

  async remove(id: string, currentUserId: string): Promise<Lead> {
    try {
      // Check if lead exists
      const existingLead = await this.prisma.lead.findUnique({
        where: { id, deletedAt: null },
      });

      if (!existingLead) {
        throw new NotFoundException('Lead not found');
      }

      // Check permissions
      const canDelete = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.LEAD, action: ActionType.DELETE },
        existingLead,
      );

      if (!canDelete) {
        throw new ForbiddenException(
          'Insufficient permissions to delete this lead',
        );
      }

      // Soft delete
      const lead = await this.prisma.lead.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
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
        },
      });

      this.logger.log(`Lead deleted: ${lead.title}`);
      return lead;
    } catch (error) {
      this.logger.error(`Failed to delete lead: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete lead');
    }
  }

  async convertToDeal(leadId: string, currentUserId: string): Promise<any> {
    try {
      // Check if lead exists
      const existingLead = await this.prisma.lead.findUnique({
        where: { id: leadId, deletedAt: null },
      });

      if (!existingLead) {
        throw new NotFoundException('Lead not found');
      }

      // Check permissions
      const canUpdate = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.LEAD, action: ActionType.UPDATE },
        existingLead,
      );

      const canCreateDeal = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.DEAL, action: ActionType.CREATE },
      );

      if (!canUpdate || !canCreateDeal) {
        throw new ForbiddenException(
          'Insufficient permissions to convert lead to deal',
        );
      }

      // Start transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create deal from lead
        const deal = await tx.deal.create({
          data: {
            title: existingLead.title,
            contactId: existingLead.contactId,
            companyId: existingLead.companyId,
            leadId: existingLead.id,
            assignedToId: existingLead.assignedToId,
            createdById: currentUserId,
            value: existingLead.value || 0,
            stage: 'PROSPECTING',
            probability: 25, // Default probability
            priority: existingLead.priority,
            expectedCloseDate: existingLead.expectedCloseDate,
            description: existingLead.description,
          },
        });

        // Update lead status to converted
        const updatedLead = await tx.lead.update({
          where: { id: leadId },
          data: { status: 'CONVERTED' },
        });

        return { deal, lead: updatedLead };
      });

      this.logger.log(`Lead converted to deal: ${result.lead.title}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to convert lead to deal: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to convert lead to deal');
    }
  }
}
