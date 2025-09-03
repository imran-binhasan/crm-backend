import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

@InputType()
export class CreateDealInput {
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
  @IsString()
  stage?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability?: number;

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
  @IsDateString()
  actualCloseDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
