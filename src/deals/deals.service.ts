import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { BaseService } from '../common/services/base.service';
import { CreateDealInput } from './dto/create-deal.input';
import { UpdateDealInput } from './dto/update-deal.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { Deal } from './entities/deal.entity';
import { DealMapper } from './mappers/deal.mapper';

@Injectable()
export class DealsService extends BaseService<
  Deal,
  CreateDealInput,
  UpdateDealInput
> {
  protected readonly resourceType = ResourceType.DEAL;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly rbacService: RbacService,
  ) {
    super(prisma, rbacService, 'DealsService');
  }

  // Implementation of abstract methods from BaseService
  protected async performCreate(
    data: CreateDealInput,
    currentUserId: string,
  ): Promise<Deal> {
    // Validation logic
    if (!data.title || data.value === undefined) {
      throw new BadRequestException('Deal title and value are required');
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

    // Validate lead if provided
    if (data.leadId) {
      const leadExists = await this.prisma.lead.findUnique({
        where: { id: data.leadId, deletedAt: null },
      });
      if (!leadExists) {
        throw new BadRequestException('Invalid lead ID provided');
      }
    }

    const dealData = {
      ...data,
      createdById: currentUserId,
      stage: data.stage || 'PROSPECTING',
      priority: data.priority || 'MEDIUM',
      probability: data.probability || 0,
      isActive: data.isActive ?? true,
      expectedCloseDate: data.expectedCloseDate
        ? new Date(data.expectedCloseDate)
        : null,
      actualCloseDate: data.actualCloseDate
        ? new Date(data.actualCloseDate)
        : null,
    };

    const prismaDeal = await this.prisma.deal.create({
      data: dealData as any,
      include: this.getIncludeOptions(),
    });

    return DealMapper.toDomain(prismaDeal);
  }

  protected async performFindMany(options: any): Promise<Deal[]> {
    const prismaDeals = await this.prisma.deal.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });

    return DealMapper.toDomainArray(prismaDeals);
  }

  protected async performFindUnique(id: string): Promise<Deal | null> {
    const prismaDeal = await this.prisma.deal.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeOptions(),
    });

    return prismaDeal ? DealMapper.toDomain(prismaDeal) : null;
  }

  protected async performUpdate(
    id: string,
    data: UpdateDealInput,
    currentUserId: string,
  ): Promise<Deal> {
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
      actualCloseDate: data.actualCloseDate
        ? new Date(data.actualCloseDate)
        : updateData.actualCloseDate,
    };

    const prismaDeal = await this.prisma.deal.update({
      where: { id },
      data: processedData as any,
      include: this.getIncludeOptions(),
    });

    return DealMapper.toDomain(prismaDeal);
  }

  protected async performSoftDelete(
    id: string,
    currentUserId: string,
  ): Promise<void> {
    await this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.deal.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.deal.count(options);
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
  async updateStage(
    dealId: string,
    stage: string,
    currentUserId: string,
  ): Promise<Deal> {
    await this.checkPermission(currentUserId, ActionType.UPDATE);

    const deal = await this.findOne(dealId, currentUserId);

    return this.safeExecute(async () => {
      const updatedDeal = await this.prisma.deal.update({
        where: { id: dealId },
        data: { stage: stage as any },
        include: this.getIncludeOptions(),
      });

      this.logger.log(`Deal ${dealId} stage updated to ${stage}`);
      return DealMapper.toDomain(updatedDeal);
    }, `Failed to update deal stage for ${dealId}`);
  }

  // Override buildWhereClause for deal-specific search
  protected async buildWhereClause(filters?: any, currentUserId?: string): Promise<any> {
    const where = await super.buildWhereClause(filters, currentUserId);

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.stage) {
      where.stage = filters.stage;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters?.minValue) {
      where.value = { ...where.value, gte: filters.minValue };
    }

    if (filters?.maxValue) {
      where.value = { ...where.value, lte: filters.maxValue };
    }

    return where;
  }
}
