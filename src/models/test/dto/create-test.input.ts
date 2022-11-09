import { InputType, Int, Field } from '@nestjs/graphql';
import { CreateTestQuestionInput } from './create-test-question.input';

@InputType()
export class CreateTestInput {

  @Field()
  title: string;

  @Field()
  courseId: string;

  @Field()
  gradeId: string;

  @Field()
  description: string;

  @Field()
  due: Date;

  @Field()
  open: boolean;

  @Field()
  allowReviewPreviousTest: boolean;

  @Field()
  limit: number;

  @Field(()=>[CreateTestQuestionInput])
  questions: CreateTestQuestionInput[];
}
