/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */

import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ProfileAvailability, Pronouns, Roles } from '@prisma/client';
import { ParentChild } from '../../parent-child/entities/parent-child.entity';
import { Course } from '../../course/entities/course.entity';
// eslint-disable-next-line max-len
import { StudentToCourse } from '../../course/entities/student-to-course.entity';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  birthday: Date;

  @Field({ nullable: true })
  pronouns: Pronouns;

  @Field({ nullable: true })
  profilePicture: string;

  @Field({ nullable: true })
  bio: string;

  @Field({ nullable: true })
  interests: string;

  @Field({ nullable: true })
  bannerPicture: string;

  @Field({ nullable: true, defaultValue: false })
  tfaEnabled: boolean;

  @Field({ nullable: true })
  tfaSecret: string;

  @Field()
  confidential: boolean;

  @Field()
  profileAvailability: ProfileAvailability;

  @Field()
  role: Roles;

  @Field(() => [Course])
  teacherCourses: Course[];

  @Field(() => [StudentToCourse])
  studentCourses: StudentToCourse[];

  @Field({ nullable: true })
  schoolId: string;

  @Field({ nullable: true })
  districtId: string;

  @Field(() => [ParentChild])
  children: ParentChild[];

  @Field(() => [ParentChild])
  parents: ParentChild[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
