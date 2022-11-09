import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Course } from './course.entity';

@ObjectType()
export class StudentToCourse {
  @Field(() => ID)
  id: string;

  @Field()
  studentId: string;

  @Field()
  courseId: string;

  @Field(() => User, { nullable: true })
  student: User;

  @Field(() => Course, { nullable: true })
  course: Course;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
