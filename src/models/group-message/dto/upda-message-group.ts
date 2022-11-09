import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateMessageGroupInput } from './create-message-group';

@InputType()
export class UpdateMessageGroupInput extends PartialType(
  CreateMessageGroupInput,
) {
  @Field()
  id: string;
}
