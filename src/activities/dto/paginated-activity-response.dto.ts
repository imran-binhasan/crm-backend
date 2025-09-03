import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { Activity } from '../entities/activity.entity';

@ObjectType()
export class PaginatedActivityResponse extends PaginatedResponse<Activity> {
  @Field(() => [Activity])
  items: Activity[];
}
