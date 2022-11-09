import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateGroupMessageInput {
  @Field()
  text: string;

  @Field({ nullable: true })
  filePath: string;

  @Field()
  messageGroupId: string;
}
