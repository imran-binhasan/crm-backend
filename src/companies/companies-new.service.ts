import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { BaseService } from '../common/services/base.service';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { ResourceType } from '../common/rbac/permission.types';
import { Company } from './entities/company.entity';
import { CompanyMapper } from './mappers/company.mapper';

@Injectable()
export class CompaniesService extends BaseService<
  Company,
  CreateCompanyInput,
  UpdateCompanyInput
> {
  protected readonly resourceType = ResourceType.COMPANY;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly rbacService: RbacService,
  ) {
    super(prisma, rbacService, 'CompaniesService');
  }

  // Implementation of abstract methods from BaseService
  protected async performCreate(data: CreateCompanyInput, currentUserId: string): Promise<Company> {
    await this.validateCreateInput(data, currentUserId);

    const company = await this.prisma.company.create({
      data: {
        ...data,
        createdById: currentUserId,
        status: data.status || 'PROSPECT',
      },
      include: this.getIncludeOptions(),
    });

    return CompanyMapper.toDomain(company);
  }

  protected async performFindMany(options: any): Promise<Company[]> {
    const companies = await this.prisma.company.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });

    return CompanyMapper.toDomainArray(companies);
  }

  protected async performFindUnique(id: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeOptions(),
    });

    return company ? CompanyMapper.toDomain(company) : null;
  }

  protected async performUpdate(
    id: string,
    data: UpdateCompanyInput,
    currentUserId: string,
  ): Promise<Company> {
    await this.validateUpdateInput(id, data, currentUserId);

    const { id: _, ...updateData } = data;

    const company = await this.prisma.company.update({
      where: { id },
      data: updateData,
      include: this.getIncludeOptions(),
    });

    return CompanyMapper.toDomain(company);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.company.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.company.count(options);
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
      _count: {
        select: {
          contacts: true,
          leads: true,
          deals: true,
        },
      },
    };
  }

  private async validateCreateInput(
    data: CreateCompanyInput,
    currentUserId: string,
  ): Promise<void> {
    // Validate required fields
    if (!data.name?.trim()) {
      throw new BadRequestException('Company name is required');
    }

    // Check if company with same name exists
    const existingCompany = await this.prisma.company.findFirst({
      where: {
        name: data.name.trim(),
        deletedAt: null,
      },
    });
    if (existingCompany) {
      throw new BadRequestException('Company with this name already exists');
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
      const existingCompanyWithEmail = await this.prisma.company.findFirst({
        where: {
          email: data.email,
          deletedAt: null,
        },
      });
      if (existingCompanyWithEmail) {
        throw new BadRequestException('Company with this email already exists');
      }
    }
  }

  private async validateUpdateInput(
    id: string,
    data: UpdateCompanyInput,
    currentUserId: string,
  ): Promise<void> {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingCompany) {
      throw new NotFoundException('Company not found');
    }

    // Validate name uniqueness if provided and changed
    if (data.name && data.name.trim() !== existingCompany.name) {
      const existingCompanyWithName = await this.prisma.company.findFirst({
        where: {
          name: data.name.trim(),
          deletedAt: null,
          id: { not: id },
        },
      });
      if (existingCompanyWithName) {
        throw new BadRequestException('Company with this name already exists');
      }
    }

    // Validate assigned user if provided and changed
    if (data.assignedToId && data.assignedToId !== existingCompany.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: data.assignedToId, isActive: true },
      });
      if (!user) {
        throw new BadRequestException('Invalid assigned user ID provided');
      }
    }

    // Validate email uniqueness if provided and changed
    if (data.email && data.email !== existingCompany.email) {
      const existingCompanyWithEmail = await this.prisma.company.findFirst({
        where: {
          email: data.email,
          deletedAt: null,
          id: { not: id },
        },
      });
      if (existingCompanyWithEmail) {
        throw new BadRequestException('Company with this email already exists');
      }
    }
  }

  private getDefaultOrderBy() {
    return { name: 'asc' as const };
  }

  // Business logic methods
  /**
   * Assign company to a user
   */
  async assignToUser(
    companyId: string,
    userId: string,
    currentUserId: string,
  ): Promise<Company> {
    try {
      // Check if company exists
      const existingCompany = await this.findOne(companyId, currentUserId);

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId, isActive: true },
      });

      if (!user) {
        throw new BadRequestException('Invalid user ID provided');
      }

      // Update company
      const updatedCompany = await this.update(
        companyId,
        { id: companyId, assignedToId: userId },
        currentUserId,
      );

      this.logger.log(
        `Company assigned: ${existingCompany.name} to ${user.firstName} ${user.lastName}`,
      );

      return updatedCompany;
    } catch (error) {
      this.logger.error(`Failed to assign company: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find companies by industry
   */
  async findByIndustry(
    industry: string,
    currentUserId: string,
    pagination?: { take?: number; skip?: number },
  ): Promise<Company[]> {
    const filters = await this.buildWhereClause(
      { industry },
      currentUserId,
    );
    
    const companies = await this.prisma.company.findMany({
      where: filters,
      include: this.getIncludeOptions(),
      take: pagination?.take,
      skip: pagination?.skip,
      orderBy: this.getDefaultOrderBy(),
    });

    return CompanyMapper.toDomainArray(companies);
  }

  /**
   * Find companies by status
   */
  async findByStatus(
    status: string,
    currentUserId: string,
    pagination?: { take?: number; skip?: number },
  ): Promise<Company[]> {
    const filters = await this.buildWhereClause(
      { status },
      currentUserId,
    );
    
    const companies = await this.prisma.company.findMany({
      where: filters,
      include: this.getIncludeOptions(),
      take: pagination?.take,
      skip: pagination?.skip,
      orderBy: this.getDefaultOrderBy(),
    });

    return CompanyMapper.toDomainArray(companies);
  }

  /**
   * Find companies by assigned user
   */
  async findByAssignedUser(
    assignedToId: string,
    currentUserId: string,
    pagination?: { take?: number; skip?: number },
  ): Promise<Company[]> {
    const filters = await this.buildWhereClause(
      { assignedToId },
      currentUserId,
    );
    
    const companies = await this.prisma.company.findMany({
      where: filters,
      include: this.getIncludeOptions(),
      take: pagination?.take,
      skip: pagination?.skip,
      orderBy: this.getDefaultOrderBy(),
    });

    return CompanyMapper.toDomainArray(companies);
  }
}
