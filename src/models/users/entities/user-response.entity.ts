/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */

import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ProfileAvailability, Pronouns, Roles } from '@prisma/client';
import { Course } from '../../course/entities/course.entity';

@ObjectType()
export class UserResponse {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field()
  email: string;

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
  tfaEnabled: boolean;

  @Field()
  confidential: boolean;

  @Field()
  profileAvailability: ProfileAvailability;

  @Field()
  role: Roles;

  @Field(() => [Course], { nullable: true })
  courses: Course[];

  @Field({ nullable: true })
  schoolId: string;

  @Field()
  districtId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
