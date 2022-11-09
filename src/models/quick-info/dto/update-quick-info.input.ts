import { Field, InputType } from '@nestjs/graphql';
import { CreateQuickInfoInput } from './create-quick-info.input';

@InputType()
export class UpdateQuickInfoInput extends CreateQuickInfoInput {
  @Field()
  id: string;
}
