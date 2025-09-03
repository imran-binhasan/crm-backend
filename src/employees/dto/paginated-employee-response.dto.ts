import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { Employee } from '../entities/employee.entity';

@ObjectType()
export class PaginatedEmployeeResponse extends PaginatedResponse<Employee> {
  @Field(() => [Employee])
  items: Employee[];
}
