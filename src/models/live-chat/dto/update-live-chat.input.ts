import { CreateLiveChatInput } from './create-live-chat.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateLiveChatInput extends PartialType(CreateLiveChatInput) {
  @Field(() => Int)
  id: number;
}
