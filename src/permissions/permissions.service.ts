import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionInput): Promise<Permission> {
    return this.prisma.permission.create({ data });
  }

  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async update(id: string, data: UpdatePermissionInput): Promise<Permission> {
    return this.prisma.permission.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Permission> {
    return this.prisma.permission.delete({ where: { id } });
  }
}
