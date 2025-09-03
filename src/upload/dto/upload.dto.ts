import { Field, InputType, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { UploadEntityType } from '../interfaces/upload.interface';

// Register enum for GraphQL
registerEnumType(UploadEntityType, {
  name: 'UploadEntityType',
  description: 'The type of entity the file is being uploaded for',
});

@InputType()
export class FileUploadInput {
  @Field(() => ID)
  @IsUUID()
  entityId: string;

  @Field(() => UploadEntityType)
  @IsEnum(UploadEntityType)
  entityType: UploadEntityType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fileName?: string;
}

@ObjectType()
export class FileUploadResponse {
  @Field()
  url: string;

  @Field()
  publicId: string;

  @Field()
  originalName: string;

  @Field()
  size: number;

  @Field()
  mimeType: string;

  @Field()
  uploadedAt: Date;
}

@InputType()
export class DeleteFileInput {
  @Field()
  @IsString()
  publicId: string;
}
