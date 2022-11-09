import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AddGroupModeratorInput {
  @Field()
  id: string;

  @Field()
  userId: string;
}
