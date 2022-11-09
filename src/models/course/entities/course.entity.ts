import { Field, ID, ObjectType } from '@nestjs/graphql';

import { User } from '../../users/entities/user.entity';
import { StudentToCourse } from './student-to-course.entity';
import { Announcement } from '../../announcement/entities/announcement.entity';

@ObjectType()
export class Course {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  courseCode: string;

  @Field({ nullable: true })
  picture: string;

  @Field()
  description: string;

  @Field()
  teacherId: string;

  @Field()
  schoolId: string;

  @Field(() => User, { nullable: true })
  teacher: User;

  @Field(() => [StudentToCourse])
  students: StudentToCourse[];

  @Field(() => [Announcement])
  announcements: Announcement[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
