import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateDealInput } from './dto/create-deal.input';
import { UpdateDealInput } from './dto/update-deal.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { Deal } from '@prisma/client';

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(data: CreateDealInput, currentUserId: string): Promise<Deal> {
    try {
      this.logger.log('Creating deal', {
        currentUserId,
        data: { title: data.title },
      });

      // Check permissions
      const canCreate = await this.rbacService.hasPermission(currentUserId, {
        resource: ResourceType.DEAL,
        action: ActionType.CREATE,
      });
      if (!canCreate) {
        throw new ForbiddenException('Insufficient permissions to create deal');
      }

      // Validate required fields
      if (!data.title || data.value === undefined) {
        throw new BadRequestException('Deal title and value are required');
      }

      // Validate relationships
      if (data.contactId) {
        const contactExists = await this.prisma.contact.findUnique({
          where: { id: data.contactId, deletedAt: null },
        });
        if (!contactExists) {
          throw new BadRequestException('Invalid contact ID provided');
        }
      }

      if (data.companyId) {
        const companyExists = await this.prisma.company.findUnique({
          where: { id: data.companyId, deletedAt: null },
        });
        if (!companyExists) {
          throw new BadRequestException('Invalid company ID provided');
        }
      }

      if (data.assignedToId) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: data.assignedToId, isActive: true },
        });
        if (!userExists) {
          throw new BadRequestException('Invalid assigned user ID provided');
        }
      }

      const dealData = {
        ...data,
        createdById: currentUserId,
        stage: (data.stage as any) || 'PROSPECTING',
        priority: (data.priority as any) || 'MEDIUM',
        probability: data.probability || 0,
        expectedCloseDate: data.expectedCloseDate
          ? new Date(data.expectedCloseDate)
          : null,
        actualCloseDate: data.actualCloseDate
          ? new Date(data.actualCloseDate)
          : null,
      };

      const deal = await this.prisma.deal.create({
        data: dealData as any,
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

      this.logger.log(`Deal created: ${deal.title} - $${deal.value}`);
      return deal;
    } catch (error) {
      this.logger.error(`Failed to create deal: ${error.message}`);
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create deal');
    }
  }

  async findAll(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Deal[]> {
    try {
      // Check permissions and get filters
      const hasPermission = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.DEAL, action: ActionType.READ },
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          'Insufficient permissions to access deals',
        );
      }

      const filters = await this.rbacService.getPermissionFilters(
        currentUserId,
        ResourceType.DEAL,
      );

      const deals = await this.prisma.deal.findMany({
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

      return deals;
    } catch (error) {
      this.logger.error('Error finding deals', {
        error: error.message,
        currentUserId,
      });
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve deals');
    }
  }

  async findOne(id: string, currentUserId: string): Promise<Deal> {
    const deal = await this.prisma.deal.findUnique({
      where: { id, deletedAt: null },
      include: {
        contact: true,
        company: true,
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

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    const canRead = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.DEAL, action: ActionType.READ },
      deal,
    );

    if (!canRead) {
      throw new ForbiddenException(
        'Insufficient permissions to view this deal',
      );
    }

    return deal;
  }

  async update(
    id: string,
    data: UpdateDealInput,
    currentUserId: string,
  ): Promise<Deal> {
    const existingDeal = await this.prisma.deal.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingDeal) {
      throw new NotFoundException('Deal not found');
    }

    const canUpdate = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.DEAL, action: ActionType.UPDATE },
      existingDeal,
    );

    if (!canUpdate) {
      throw new ForbiddenException(
        'Insufficient permissions to update this deal',
      );
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

    return this.prisma.deal.update({
      where: { id },
      data: processedData as any,
      include: {
        contact: true,
        company: true,
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
  }

  async remove(id: string, currentUserId: string): Promise<Deal> {
    const existingDeal = await this.prisma.deal.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingDeal) {
      throw new NotFoundException('Deal not found');
    }

    const canDelete = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.DEAL, action: ActionType.DELETE },
      existingDeal,
    );

    if (!canDelete) {
      throw new ForbiddenException(
        'Insufficient permissions to delete this deal',
      );
    }

    return this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: {
        contact: true,
        company: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}
