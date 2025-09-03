import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { Contact } from '../entities/contact.entity';

@ObjectType()
export class PaginatedContactResponse extends PaginatedResponse<Contact> {
  @Field(() => [Contact])
  items: Contact[];
}
