import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsJSON } from 'class-validator';

@InputType()
export class CreateReportDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  type: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  filters?: string; // JSON string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  schedule?: string; // Cron expression

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  outputFormat?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  recipients?: string[];
}
