import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ResourceType, ActionType } from '../../common/rbac/permission.types';

// Register GraphQL enums
registerEnumType(ResourceType, {
  name: 'ResourceType',
  description: 'Available resource types in the system',
});

registerEnumType(ActionType, {
  name: 'ActionType',
  description: 'Available action types for permissions',
});

@InputType()
export class CreatePermissionInput {
  @Field(() => ResourceType)
  @IsEnum(ResourceType)
  resource: ResourceType;

  @Field(() => ActionType)
  @IsEnum(ActionType)
  action: ActionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
