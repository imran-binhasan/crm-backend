import { CreateInvoiceDto } from './create-invoice.dto';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}
