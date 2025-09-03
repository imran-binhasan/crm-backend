import { CreateClientInput } from './create-client.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateClientInput extends PartialType(CreateClientInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
