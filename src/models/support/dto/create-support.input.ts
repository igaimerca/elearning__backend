import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSupportInput {
  @Field()
  name: string;

  @Field()
  title: string;

  @Field()
  email: string;

  @Field()
  description: string;
}
