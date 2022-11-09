import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AddGroupMemberInput {
  @Field()
  id: string;

  @Field()
  userId: string;
}
