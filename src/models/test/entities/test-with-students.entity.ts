import { ObjectType, Field } from '@nestjs/graphql';

import { Course } from 'src/models/course/entities/course.entity';
import { User } from 'src/models/users/entities/user.entity';
import { TestQuestion } from './test-question.entity';

@ObjectType()
export class TestWithStudents {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  courseId: string;

  @Field(()=>Course)
  course: Course;

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

  @Field(()=>[TestQuestion])
  TestQuestions: TestQuestion[];

  @Field(()=>[User])
  students: User[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
