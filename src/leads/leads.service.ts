import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { BaseService } from '../common/services/base.service';
import { CreateLeadInput } from './dto/create-lead.input';
import { UpdateLeadInput } from './dto/update-lead.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { Lead } from './entities/lead.entity';
import { LeadMapper } from './mappers/lead.mapper';

@Injectable()
export class LeadsService extends BaseService<
  Lead,
  CreateLeadInput,
  UpdateLeadInput
> {
  protected readonly resourceType = ResourceType.LEAD;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly rbacService: RbacService,
  ) {
    super(prisma, rbacService, 'LeadsService');
  }

  // Implementation of abstract methods from BaseService
  protected async performCreate(
    data: CreateLeadInput,
    currentUserId: string,
  ): Promise<Lead> {
    // Validation logic
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
      status: data.status || 'NEW',
      priority: data.priority || 'MEDIUM',
      isActive: data.isActive ?? true,
      expectedCloseDate: data.expectedCloseDate
        ? new Date(data.expectedCloseDate)
        : null,
    };

    const prismaLead = await this.prisma.lead.create({
      data: leadData as any,
      include: this.getIncludeOptions(),
    });

    return LeadMapper.toDomain(prismaLead);
  }

  protected async performFindMany(options: any): Promise<Lead[]> {
    const prismaLeads = await this.prisma.lead.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });

    return LeadMapper.toDomainArray(prismaLeads);
  }

  protected async performFindUnique(id: string): Promise<Lead | null> {
    const prismaLead = await this.prisma.lead.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeOptions(),
    });

    return prismaLead ? LeadMapper.toDomain(prismaLead) : null;
  }

  protected async performUpdate(
    id: string,
    data: UpdateLeadInput,
    currentUserId: string,
  ): Promise<Lead> {
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

    const { id: _, ...updateData } = data;
    const processedData = {
      ...updateData,
      expectedCloseDate: data.expectedCloseDate
        ? new Date(data.expectedCloseDate)
        : updateData.expectedCloseDate,
    };

    const prismaLead = await this.prisma.lead.update({
      where: { id },
      data: processedData as any,
      include: this.getIncludeOptions(),
    });

    return LeadMapper.toDomain(prismaLead);
  }

  protected async performSoftDelete(
    id: string,
    currentUserId: string,
  ): Promise<void> {
    await this.prisma.lead.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
      },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.lead.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.lead.count(options);
  }

  private getIncludeOptions() {
    return {
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
    };
  }

  // Custom business logic methods
  async convertToDeal(leadId: string, currentUserId: string): Promise<any> {
    await this.checkPermission(currentUserId, ActionType.UPDATE);

    const lead = await this.findOne(leadId, currentUserId);

    const canCreateDeal = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.DEAL, action: ActionType.CREATE },
    );

    if (!canCreateDeal) {
      throw new ForbiddenException(
        'Insufficient permissions to create deal',
      );
    }

    // Start transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create deal from lead
      const deal = await tx.deal.create({
        data: {
          title: lead.title,
          contactId: lead.contactId,
          companyId: lead.companyId,
          leadId: lead.id,
          assignedToId: lead.assignedToId,
          createdById: currentUserId,
          value: lead.value || 0,
          stage: 'PROSPECTING',
          probability: 25, // Default probability
          priority: lead.priority as any,
          expectedCloseDate: lead.expectedCloseDate,
          description: lead.description,
        },
      });

      // Update lead status to converted
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: { 
          status: 'CONVERTED',
        },
        include: this.getIncludeOptions(),
      });

      return { 
        deal, 
        lead: LeadMapper.toDomain(updatedLead)
      };
    });

    this.logger.log(`Lead converted to deal: ${result.lead.title}`);
    return result;
  }

  // Override buildWhereClause for lead-specific search
  protected async buildWhereClause(filters?: any, currentUserId?: string): Promise<any> {
    const where = await super.buildWhereClause(filters, currentUserId);

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { source: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    return where;
  }
}
