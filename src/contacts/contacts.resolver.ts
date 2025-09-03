import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Contact } from './entities/contact.entity';
import { CreateContactInput } from './dto/create-contact.input';
import { UpdateContactInput } from './dto/update-contact.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequireResource } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResourceType, ActionType } from '../common/rbac/permission.types';
import { User } from '../users/entities/user.entity';
import { PaginatedContactResponse } from './dto/paginated-contact-response.dto';
import { PaginationInput } from '../common/dto/pagination.input';

@Resolver(() => Contact)
@UseGuards(JwtAuthGuard)
export class ContactsResolver {
  constructor(private readonly contactsService: ContactsService) {}

  @Query(() => PaginatedContactResponse, { name: 'contacts' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.CONTACT, ActionType.READ)
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

    const result = await this.contactsService.findAll(currentUser.id, paginationOptions, filterOptions);
    return {
      items: result.data,
      pagination: result.meta,
    };
  }

  @Query(() => Contact, { name: 'contact' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.CONTACT, ActionType.READ)
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.contactsService.findOne(id, currentUser.id);
  }

  @Mutation(() => Contact)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.CONTACT, ActionType.CREATE)
  createContact(
    @Args('createContactInput') createContactInput: CreateContactInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.contactsService.create(createContactInput, currentUser.id);
  }

  @Mutation(() => Contact)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.CONTACT, ActionType.UPDATE)
  updateContact(
    @Args('updateContactInput') updateContactInput: UpdateContactInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.contactsService.update(
      updateContactInput.id,
      updateContactInput,
      currentUser.id,
    );
  }

  @Mutation(() => Boolean, { description: 'Returns true if contact was successfully deleted' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.CONTACT, ActionType.DELETE)
  async removeContact(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ) {
    await this.contactsService.remove(id, currentUser.id);
    return true;
  }

  @Mutation(() => Contact)
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.CONTACT, ActionType.ASSIGN)
  assignContact(
    @Args('contactId', { type: () => ID }) contactId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.contactsService.assignToUser(contactId, userId, currentUser.id);
  }

  @Query(() => [Contact], { name: 'contactsByCompany' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.CONTACT, ActionType.READ)
  findByCompany(
    @Args('companyId', { type: () => ID }) companyId: string,
    @CurrentUser() currentUser: User,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
  ) {
    return this.contactsService.findByCompany(
      companyId,
      currentUser.id,
      { take, skip },
    );
  }

  @Query(() => [Contact], { name: 'contactsByAssignedUser' })
  @UseGuards(PermissionGuard)
  @RequireResource(ResourceType.CONTACT, ActionType.READ)
  findByAssignedUser(
    @Args('assignedToId', { type: () => ID }) assignedToId: string,
    @CurrentUser() currentUser: User,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
  ) {
    return this.contactsService.findByAssignedUser(
      assignedToId,
      currentUser.id,
      { take, skip },
    );
  }
}
