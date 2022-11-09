import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateTestQuestionInput {

  @Field()
  question: string;

  @Field()
  points: number;
}
