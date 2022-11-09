import { CreateErrorInput } from './create-error.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateErrorInput extends PartialType(CreateErrorInput) {
  @Field(() => Int)
  id: number;
}
