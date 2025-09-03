import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, IsBoolean, Length } from 'class-validator';

@InputType({ isAbstract: true })
export abstract class BaseCreateDto {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType({ isAbstract: true })
export abstract class BaseUpdateDto {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType({ isAbstract: true })
export abstract class BaseQueryDto {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export abstract class BaseDto {
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}
