import { CreateReportDto } from './create-report.dto';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateReportDto extends PartialType(CreateReportDto) {}
