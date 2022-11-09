import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateGroupInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  photo: string;

  @Field()
  confidential: boolean;
}
