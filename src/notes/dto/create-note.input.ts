import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsArray, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateNoteInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  // Related entities
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  contactId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  companyId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  leadId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  dealId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  activityId?: string;
}
