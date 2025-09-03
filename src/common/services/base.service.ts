import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RbacService } from '../rbac/rbac.service';
import { 
  BaseEntity, 
  PaginationOptions, 
  PaginatedResponse, 
  FilterOptions,
  ServiceResponse 
} from '../interfaces/base.interface';
import { ResourceType, ActionType } from '../rbac/permission.types';

@Injectable()
export abstract class BaseService<T extends BaseEntity, CreateDto, UpdateDto> {
  protected abstract readonly resourceType: ResourceType;
  protected readonly logger: Logger;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly rbacService: RbacService,
    loggerContext: string,
  ) {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Create a new entity
   */
  async create(createDto: CreateDto, currentUserId: string): Promise<T> {
    await this.checkPermission(currentUserId, ActionType.CREATE);
    
    try {
      const data = await this.performCreate(createDto, currentUserId);
      this.logger.log(`Created ${this.resourceType} with ID: ${data.id}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to create ${this.resourceType}:`, error);
      throw error;
    }
  }

  /**
   * Find all entities with pagination and filtering
   */
  async findAll(
    currentUserId: string,
    pagination?: PaginationOptions,
    filters?: FilterOptions,
  ): Promise<PaginatedResponse<T>> {
    await this.checkPermission(currentUserId, ActionType.READ);

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    try {
      const where = await this.buildWhereClause(filters, currentUserId);
      
      const [data, total] = await Promise.all([
        this.performFindMany({
          where,
          skip,
          take: limit,
          orderBy: this.buildOrderBy(pagination),
        }),
        this.performCount({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to find ${this.resourceType}s:`, error);
      throw error;
    }
  }

  /**
   * Find entity by ID
   */
  async findOne(id: string, currentUserId: string): Promise<T> {
    await this.checkPermission(currentUserId, ActionType.READ);

    try {
      const entity = await this.performFindUnique(id);
      
      if (!entity) {
        throw new NotFoundException(`${this.resourceType} not found`);
      }

      // Check ownership or team access if needed
      await this.checkResourceAccess(entity, currentUserId);

      return entity;
    } catch (error) {
      this.logger.error(`Failed to find ${this.resourceType} with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update entity
   */
  async update(id: string, updateDto: UpdateDto, currentUserId: string): Promise<T> {
    await this.checkPermission(currentUserId, ActionType.UPDATE);

    const existingEntity = await this.findOne(id, currentUserId);

    try {
      const updatedEntity = await this.performUpdate(id, updateDto, currentUserId);
      this.logger.log(`Updated ${this.resourceType} with ID: ${id}`);
      return updatedEntity;
    } catch (error) {
      this.logger.error(`Failed to update ${this.resourceType} with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete entity
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    await this.checkPermission(currentUserId, ActionType.DELETE);

    const existingEntity = await this.findOne(id, currentUserId);

    try {
      await this.performSoftDelete(id, currentUserId);
      this.logger.log(`Soft deleted ${this.resourceType} with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete ${this.resourceType} with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Hard delete entity (use with caution)
   */
  async hardDelete(id: string, currentUserId: string): Promise<void> {
    await this.checkPermission(currentUserId, ActionType.DELETE);

    const existingEntity = await this.findOne(id, currentUserId);

    try {
      await this.performHardDelete(id);
      this.logger.log(`Hard deleted ${this.resourceType} with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to hard delete ${this.resourceType} with ID ${id}:`, error);
      throw error;
    }
  }

  // Abstract methods to be implemented by child classes
  protected abstract performCreate(createDto: CreateDto, currentUserId: string): Promise<T>;
  protected abstract performFindMany(options: any): Promise<T[]>;
  protected abstract performFindUnique(id: string): Promise<T | null>;
  protected abstract performUpdate(id: string, updateDto: UpdateDto, currentUserId: string): Promise<T>;
  protected abstract performSoftDelete(id: string, currentUserId: string): Promise<void>;
  protected abstract performHardDelete(id: string): Promise<void>;
  protected abstract performCount(options: any): Promise<number>;

  // Helper methods that can be overridden
  protected async buildWhereClause(filters?: FilterOptions, currentUserId?: string): Promise<any> {
    const where: any = { deletedAt: null };

    if (filters?.search) {
      // Default search implementation - override in child classes
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return where;
  }

  protected buildOrderBy(pagination?: PaginationOptions): any {
    const sortBy = pagination?.sortBy || 'createdAt';
    const sortOrder = pagination?.sortOrder || 'desc';
    return { [sortBy]: sortOrder };
  }

  protected async checkPermission(userId: string, action: ActionType): Promise<void> {
    const hasPermission = await this.rbacService.hasPermission(userId, {
      resource: this.resourceType,
      action,
    });

    if (!hasPermission) {
      throw new ForbiddenException(`Insufficient permissions for ${action} on ${this.resourceType}`);
    }
  }

  protected async checkResourceAccess(entity: T, currentUserId: string): Promise<void> {
    // Basic ownership check - can be overridden in child classes
    if ('createdById' in entity && entity.createdById !== currentUserId) {
      const hasTeamAccess = await this.rbacService.hasPermission(currentUserId, {
        resource: this.resourceType,
        action: ActionType.READ,
      });

      if (!hasTeamAccess) {
        throw new ForbiddenException('You do not have access to this resource');
      }
    }
  }

  /**
   * Utility method for safe service responses
   */
  protected createServiceResponse<TData>(
    success: boolean,
    data?: TData,
    message?: string,
    error?: string,
  ): ServiceResponse<TData> {
    return {
      success,
      data,
      message,
      error,
    };
  }

  /**
   * Utility method for handling async operations with proper error handling
   */
  protected async safeExecute<TResult>(
    operation: () => Promise<TResult>,
    errorMessage: string,
  ): Promise<TResult> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(errorMessage, error);
      throw error;
    }
  }
}
