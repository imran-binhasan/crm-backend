import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { ResourceType, ActionType } from '../common/rbac/permission.types';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  // Implement CRUD methods similar to other services
  async findAll(currentUserId: string) {
    return this.prisma.employee.findMany({
      where: { deletedAt: null },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      }
    });
  }
}
