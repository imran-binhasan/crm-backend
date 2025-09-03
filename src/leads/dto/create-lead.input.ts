import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsDateString,
} from 'class-validator';

@InputType()
export class CreateLeadInput {
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
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  priority?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
