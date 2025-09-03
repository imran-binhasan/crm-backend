import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { BaseCreateDto } from '../../common/dto/base.dto';

enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
  CONVERTED = 'CONVERTED',
}

enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@InputType()
export class CreateLeadInput extends BaseCreateDto {
  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  value?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  source?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;
}
