import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasNext: boolean;

  @Field(() => Boolean)
  hasPrevious: boolean;
}
