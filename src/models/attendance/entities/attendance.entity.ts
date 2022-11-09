import { Field, ObjectType } from '@nestjs/graphql';
import { AttendType } from '@prisma/client';
import { Course } from '../../course/entities/course.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Attendance {
  @Field()
  id: string;

  @Field()
  courseId: string;

  @Field(() => Course)
  course: Course;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field()
  status: AttendType;

  @Field()
  day: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
