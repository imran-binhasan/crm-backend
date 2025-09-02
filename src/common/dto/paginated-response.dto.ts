import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from './pagination-meta.dto';

@ObjectType()
export abstract class PaginatedResponse<T> {
  abstract items: T[];

  @Field(() => PaginationMeta)
  pagination: PaginationMeta;
}
