import { Injectable } from '@nestjs/common';
import { Note as PrismaNote } from '@prisma/client';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { ResourceType } from '../common/rbac/permission.types';
import { CreateNoteInput } from './dto/create-note.input';
import { UpdateNoteInput } from './dto/update-note.input';
import { Note } from './entities/note.entity';
import { NoteMapper } from './mappers/note.mapper';

@Injectable()
export class NotesService extends BaseService<
  Note,
  CreateNoteInput,
  UpdateNoteInput
> {
  protected readonly resourceType = ResourceType.NOTE;

  constructor(
    prisma: PrismaService,
    rbacService: RbacService,
  ) {
    super(prisma, rbacService, NotesService.name);
  }

  protected mapToDomain(prismaEntity: any): Note {
    return NoteMapper.toDomain(prismaEntity);
  }

  protected async performCreate(data: CreateNoteInput, currentUserId: string): Promise<Note> {
    const noteData = {
      ...data,
      createdById: currentUserId,
    };

    const result = await this.prisma.note.create({
      data: noteData as any,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  protected async performFindMany(options: any): Promise<Note[]> {
    const result = await this.prisma.note.findMany({
      ...options,
      include: this.getIncludeOptions(),
    });

    return result.map(note => this.mapToDomain(note));
  }

  protected async performFindUnique(id: string): Promise<Note | null> {
    const result = await this.prisma.note.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeOptions(),
    });

    return result ? this.mapToDomain(result) : null;
  }

  protected async performUpdate(id: string, data: UpdateNoteInput, currentUserId: string): Promise<Note> {
    const { id: _, ...updateData } = data;

    const result = await this.prisma.note.update({
      where: { id },
      data: updateData as any,
      include: this.getIncludeOptions(),
    });

    return this.mapToDomain(result);
  }

  protected async performSoftDelete(id: string, currentUserId: string): Promise<void> {
    await this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  protected async performHardDelete(id: string): Promise<void> {
    await this.prisma.note.delete({
      where: { id },
    });
  }

  protected async performCount(options: any): Promise<number> {
    return this.prisma.note.count(options);
  }

  private getIncludeOptions() {
    return {
      contact: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      company: {
        select: { id: true, name: true },
      },
      lead: {
        select: { id: true, title: true, status: true },
      },
      deal: {
        select: { id: true, title: true, stage: true, value: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    };
  }

  // Business-specific methods
  async findNotesByContact(contactId: string, currentUserId: string): Promise<Note[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaNotes = await this.prisma.note.findMany({
      where: {
        ...filters,
        contactId,
        deletedAt: null,
        OR: [{ isPrivate: false }, { createdById: currentUserId }],
      },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });

    return prismaNotes.map(note => this.mapToDomain(note));
  }

  async findNotesByCompany(companyId: string, currentUserId: string): Promise<Note[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaNotes = await this.prisma.note.findMany({
      where: {
        ...filters,
        companyId,
        deletedAt: null,
        OR: [{ isPrivate: false }, { createdById: currentUserId }],
      },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });

    return prismaNotes.map(note => this.mapToDomain(note));
  }

  async findNotesByLead(leadId: string, currentUserId: string): Promise<Note[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaNotes = await this.prisma.note.findMany({
      where: {
        ...filters,
        leadId,
        deletedAt: null,
        OR: [{ isPrivate: false }, { createdById: currentUserId }],
      },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });

    return prismaNotes.map(note => this.mapToDomain(note));
  }

  async findNotesByDeal(dealId: string, currentUserId: string): Promise<Note[]> {
    const filters = await this.rbacService.getPermissionFilters(currentUserId, this.resourceType);
    const prismaNotes = await this.prisma.note.findMany({
      where: {
        ...filters,
        dealId,
        deletedAt: null,
        OR: [{ isPrivate: false }, { createdById: currentUserId }],
      },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });

    return prismaNotes.map(note => this.mapToDomain(note));
  }

  // Override findAll to include privacy logic
  async findAll(
    currentUserId: string,
    pagination?: any,
    filters?: any,
  ): Promise<any> {
    // Add privacy filter to the where clause
    const additionalWhere = {
      OR: [{ isPrivate: false }, { createdById: currentUserId }],
    };

    // Merge with existing filters if provided
    const mergedFilters = filters ? {
      ...filters,
      additionalWhere,
    } : { additionalWhere };

    return super.findAll(currentUserId, pagination, mergedFilters);
  }

  // Override findOne to include privacy logic
  async findOne(id: string, currentUserId: string): Promise<Note> {
    const note = await this.performFindUnique(id);
    
    if (!note) {
      throw new Error('Note not found');
    }

    // Check if note is private and user is not the creator
    if (note.isPrivate && note.createdById !== currentUserId) {
      throw new Error('Cannot access private note');
    }

    // Use BaseService permission check
    return super.findOne(id, currentUserId);
  }
}
