import { CreateProjectInput } from './create-project.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateProjectInput extends PartialType(CreateProjectInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
