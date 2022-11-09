import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateGroupMessageInput } from './create-group-message.input';

@InputType()
export class UpdateGroupMessageInput extends PartialType(
  CreateGroupMessageInput,
) {
  @Field()
  id: string;
}
