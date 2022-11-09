import { Field, ObjectType } from '@nestjs/graphql';
import { Test } from './test.entity';

@ObjectType()
export class TestQuestion {

  @Field()
  id: string;

  @Field()
  question: string;

  @Field()
  testId: string;

  @Field(() => Test)
  test: Test;

  @Field()
  points: number;
}
