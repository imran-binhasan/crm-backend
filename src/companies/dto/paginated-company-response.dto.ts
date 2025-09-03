import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { Company } from '../entities/company.entity';

@ObjectType()
export class PaginatedCompanyResponse extends PaginatedResponse<Company> {
  @Field(() => [Company])
  items: Company[];
}
