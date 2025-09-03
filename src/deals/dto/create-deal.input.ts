import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { BaseCreateDto } from '../../common/dto/base.dto';

enum DealStage {
  PROSPECTING = 'PROSPECTING',
  QUALIFICATION = 'QUALIFICATION',
  NEEDS_ANALYSIS = 'NEEDS_ANALYSIS',
  VALUE_PROPOSITION = 'VALUE_PROPOSITION',
  DECISION_MAKERS = 'DECISION_MAKERS',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

enum DealPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@InputType()
export class CreateDealInput extends BaseCreateDto {
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
  leadId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @Field()
  @IsNumber()
  @Min(0)
  value: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(DealPriority)
  priority?: DealPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  actualCloseDate?: string;
}
