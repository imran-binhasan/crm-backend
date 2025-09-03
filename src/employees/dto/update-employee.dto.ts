import { CreateEmployeeDto } from './create-employee.dto';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
