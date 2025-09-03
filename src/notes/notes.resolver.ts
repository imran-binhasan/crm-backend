import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { CreateNoteInput } from './dto/create-note.input';
import { UpdateNoteInput } from './dto/update-note.input';
import { PaginatedNoteResponse } from './dto/paginated-note-response.dto';
import { PaginationInput } from '../common/dto/pagination.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { User } from '../users/entities/user.entity';

@Resolver(() => Note)
@UseGuards(JwtAuthGuard)
export class NotesResolver {
  constructor(private readonly notesService: NotesService) {}

  @Query(() => PaginatedNoteResponse, { name: 'notes' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.NOTE, ActionType.READ)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) 
    pagination?: PaginationInput,
  ) {
    // Convert PaginationInput to PaginationOptions
    const paginationOptions = pagination ? {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder?.toLowerCase() as 'asc' | 'desc',
    } : undefined;

    const filterOptions = pagination?.search ? { search: pagination.search } : {};

    const result = await this.notesService.findAll(currentUser.id, paginationOptions, filterOptions);
    return {
      items: result.data,
      pagination: result.meta,
    };
  }

  @Query(() => Note, { name: 'note' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.NOTE, ActionType.READ)
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Note> {
    return this.notesService.findOne(id, currentUser.id);
  }

  @Mutation(() => Note)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.NOTE, ActionType.CREATE)
  createNote(
    @Args('createNoteInput') createNoteInput: CreateNoteInput,
    @CurrentUser() currentUser: User,
  ): Promise<Note> {
    return this.notesService.create(createNoteInput, currentUser.id);
  }

  @Mutation(() => Note)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.NOTE, ActionType.UPDATE)
  updateNote(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateNoteInput') updateNoteInput: UpdateNoteInput,
    @CurrentUser() currentUser: User,
  ): Promise<Note> {
    return this.notesService.update(id, updateNoteInput, currentUser.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.NOTE, ActionType.DELETE)
  async removeNote(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.notesService.remove(id, currentUser.id);
    return true;
  }

  @Query(() => [Note])
  async notesByContact(
    @Args('contactId', { type: () => ID }) contactId: string,
    @CurrentUser() currentUser: User,
  ): Promise<Note[]> {
    return this.notesService.findNotesByContact(contactId, currentUser.id);
  }

  @Query(() => [Note])
  async notesByCompany(
    @Args('companyId', { type: () => ID }) companyId: string,
    @CurrentUser() currentUser: User,
  ): Promise<Note[]> {
    return this.notesService.findNotesByCompany(companyId, currentUser.id);
  }

  @Query(() => [Note])
  async notesByLead(
    @Args('leadId', { type: () => ID }) leadId: string,
    @CurrentUser() currentUser: User,
  ): Promise<Note[]> {
    return this.notesService.findNotesByLead(leadId, currentUser.id);
  }

  @Query(() => [Note])
  async notesByDeal(
    @Args('dealId', { type: () => ID }) dealId: string,
    @CurrentUser() currentUser: User,
  ): Promise<Note[]> {
    return this.notesService.findNotesByDeal(dealId, currentUser.id);
  }
}
