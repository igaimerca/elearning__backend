import { Field, ObjectType } from '@nestjs/graphql';
import { Submission } from 'src/models/submission/entities/submission.entity';

import { Course } from '../../course/entities/course.entity';

@ObjectType()
export class Assignment {
  @Field()
  id: string;

  @Field()
  courseId: string;

  @Field()
  course: Course;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  due: Date;

  @Field(()=>[Submission])
  submissions:Submission[];

  @Field({ defaultValue: 100 })
  marks: number;

  @Field()
  visible: boolean;
}
