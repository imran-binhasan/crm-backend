import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException,
  ConflictException,
  Logger 
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { Company } from '@prisma/client';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(data: CreateCompanyInput, currentUserId: string): Promise<Company> {
    try {
      this.logger.log('Creating company', { currentUserId, data: { name: data.name } });

      // Check permissions
      const canCreate = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.COMPANY, action: ActionType.CREATE }
      );
      if (!canCreate) {
        throw new ForbiddenException('Insufficient permissions to create company');
      }

      // Validate input
      if (!data.name) {
        throw new BadRequestException('Company name is required');
      }

      // Check if company with same name exists
      const existingCompany = await this.prisma.company.findFirst({
        where: { 
          name: { equals: data.name, mode: 'insensitive' },
          deletedAt: null 
        }
      });

      if (existingCompany) {
        throw new ConflictException('Company with this name already exists');
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

      const company = await this.prisma.company.create({
        data: {
          ...data,
          createdById: currentUserId,
          status: (data.status as any) || 'ACTIVE',
        } as any,
        include: {
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

      this.logger.log(`Company created: ${company.name}`);
      return company;

    } catch (error) {
      this.logger.error(`Failed to create company: ${error.message}`);
      if (error instanceof BadRequestException || 
          error instanceof ForbiddenException ||
          error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create company');
    }
  }

  async findAll(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Company[]> {
    try {
      this.logger.log('Finding all companies', { currentUserId, take, skip });

      // Check permissions
      const hasPermission = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.COMPANY, action: ActionType.READ }
      );

      if (!hasPermission) {
        throw new ForbiddenException('Insufficient permissions to access companies');
      }

      // Get permission filters
      const filters = await this.rbacService.getPermissionFilters(
        currentUserId,
        ResourceType.COMPANY
      );

      const companies = await this.prisma.company.findMany({
        where: {
          deletedAt: null,
          ...filters,
        },
        include: {
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

      this.logger.log('Successfully retrieved companies', { count: companies.length });
      return companies;

    } catch (error) {
      this.logger.error('Error finding companies', { error: error.message, currentUserId });
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve companies');
    }
  }

  async findOne(id: string, currentUserId: string): Promise<Company> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id, deletedAt: null },
        include: {
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

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      // Check permissions
      const canRead = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.COMPANY, action: ActionType.READ },
        company
      );

      if (!canRead) {
        throw new ForbiddenException('Insufficient permissions to view this company');
      }

      return company;

    } catch (error) {
      this.logger.error(`Failed to find company: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve company');
    }
  }

  async update(id: string, data: UpdateCompanyInput, currentUserId: string): Promise<Company> {
    try {
      // Check if company exists
      const existingCompany = await this.prisma.company.findUnique({
        where: { id, deletedAt: null }
      });

      if (!existingCompany) {
        throw new NotFoundException('Company not found');
      }

      // Check permissions
      const canUpdate = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.COMPANY, action: ActionType.UPDATE },
        existingCompany
      );

      if (!canUpdate) {
        throw new ForbiddenException('Insufficient permissions to update this company');
      }

      // Check for name conflicts if name is being changed
      if (data.name && data.name !== existingCompany.name) {
        const duplicateCompany = await this.prisma.company.findFirst({
          where: { 
            name: { equals: data.name, mode: 'insensitive' },
            deletedAt: null,
            id: { not: id }
          }
        });

        if (duplicateCompany) {
          throw new ConflictException('Company with this name already exists');
        }
      }

      // Validate assigned user if provided
      if (data.assignedToId && data.assignedToId !== existingCompany.assignedToId) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: data.assignedToId, isActive: true }
        });
        if (!userExists) {
          throw new BadRequestException('Invalid assigned user ID provided');
        }
      }

      const { id: _, ...updateData } = data;

      const company = await this.prisma.company.update({
        where: { id },
        data: updateData as any,
        include: {
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

      this.logger.log(`Company updated: ${company.name}`);
      return company;

    } catch (error) {
      this.logger.error(`Failed to update company: ${error.message}`);
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException ||
          error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update company');
    }
  }

  async remove(id: string, currentUserId: string): Promise<Company> {
    try {
      // Check if company exists
      const existingCompany = await this.prisma.company.findUnique({
        where: { id, deletedAt: null }
      });

      if (!existingCompany) {
        throw new NotFoundException('Company not found');
      }

      // Check permissions
      const canDelete = await this.rbacService.hasPermission(
        currentUserId,
        { resource: ResourceType.COMPANY, action: ActionType.DELETE },
        existingCompany
      );

      if (!canDelete) {
        throw new ForbiddenException('Insufficient permissions to delete this company');
      }

      // Check if company has associated records
      const associatedRecords = await this.prisma.contact.findFirst({
        where: { companyId: id, deletedAt: null }
      });

      if (associatedRecords) {
        throw new BadRequestException('Cannot delete company with associated contacts');
      }

      // Soft delete
      const company = await this.prisma.company.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: {
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

      this.logger.log(`Company deleted: ${company.name}`);
      return company;

    } catch (error) {
      this.logger.error(`Failed to delete company: ${error.message}`);
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete company');
    }
  }
}
