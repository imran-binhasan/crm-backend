import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';
import { CreateNoteInput } from './dto/create-note.input';
import { UpdateNoteInput } from './dto/update-note.input';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { Note } from '@prisma/client';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async create(data: CreateNoteInput, currentUserId: string): Promise<Note> {
    const canCreate = await this.rbacService.hasPermission(currentUserId, {
      resource: ResourceType.NOTE,
      action: ActionType.CREATE,
    });
    if (!canCreate) {
      throw new ForbiddenException('Insufficient permissions to create note');
    }

    const noteData = {
      ...data,
      createdById: currentUserId,
      tags: data.tags || [],
    };

    return this.prisma.note.create({
      data: noteData as any,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        lead: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true } },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findAll(
    currentUserId: string,
    take?: number,
    skip?: number,
  ): Promise<Note[]> {
    const hasPermission = await this.rbacService.hasPermission(currentUserId, {
      resource: ResourceType.NOTE,
      action: ActionType.READ,
    });
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions to access notes');
    }

    const filters = await this.rbacService.getPermissionFilters(
      currentUserId,
      ResourceType.NOTE,
    );

    return this.prisma.note.findMany({
      where: {
        deletedAt: null,
        ...filters,
        OR: [{ isPrivate: false }, { createdById: currentUserId }],
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        lead: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true } },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUserId: string): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: { id, deletedAt: null },
      include: {
        contact: true,
        company: true,
        lead: true,
        deal: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Check if note is private and user is not the creator
    if (note.isPrivate && note.createdById !== currentUserId) {
      throw new ForbiddenException('Cannot access private note');
    }

    const canRead = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.NOTE, action: ActionType.READ },
      note,
    );
    if (!canRead) {
      throw new ForbiddenException(
        'Insufficient permissions to view this note',
      );
    }

    return note;
  }

  async update(
    id: string,
    data: UpdateNoteInput,
    currentUserId: string,
  ): Promise<Note> {
    const existingNote = await this.prisma.note.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingNote) {
      throw new NotFoundException('Note not found');
    }

    const canUpdate = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.NOTE, action: ActionType.UPDATE },
      existingNote,
    );
    if (!canUpdate) {
      throw new ForbiddenException(
        'Insufficient permissions to update this note',
      );
    }

    const { id: _, ...updateData } = data;

    return this.prisma.note.update({
      where: { id },
      data: updateData as any,
      include: {
        contact: true,
        company: true,
        lead: true,
        deal: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async remove(id: string, currentUserId: string): Promise<Note> {
    const existingNote = await this.prisma.note.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingNote) {
      throw new NotFoundException('Note not found');
    }

    const canDelete = await this.rbacService.hasPermission(
      currentUserId,
      { resource: ResourceType.NOTE, action: ActionType.DELETE },
      existingNote,
    );
    if (!canDelete) {
      throw new ForbiddenException(
        'Insufficient permissions to delete this note',
      );
    }

    return this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: {
        contact: true,
        company: true,
        lead: true,
        deal: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }
}
