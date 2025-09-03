import { CreateInvoiceDto } from './create-invoice.dto';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}
