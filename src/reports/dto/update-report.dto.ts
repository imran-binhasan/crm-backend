import { CreateReportDto } from './create-report.dto';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateReportDto extends PartialType(CreateReportDto) {}
