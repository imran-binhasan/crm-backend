import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class CreateNoteInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  // Related entities
  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  contactId?: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  companyId?: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  leadId?: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  dealId?: string;
}
