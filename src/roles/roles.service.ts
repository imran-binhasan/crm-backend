import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { Role } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRoleInput): Promise<Role> {
    return this.prisma.role.create({ data });
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, data: UpdateRoleInput): Promise<Role> {
    return this.prisma.role.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Role> {
    return this.prisma.role.delete({ where: { id } });
  }
}
