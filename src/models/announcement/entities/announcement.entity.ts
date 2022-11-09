import { Field, ObjectType } from '@nestjs/graphql';
import { AnnouncementType } from '@prisma/client';

import { School } from '../../school/entities/school.entity';
import { District } from '../../district/entities/district.entity';
import { Course } from '../../course/entities/course.entity';
import { User } from '../../users/entities/user.entity';
@ObjectType()
export class Announcement {
  @Field()
  id: string;

  @Field()
  type: AnnouncementType;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  schoolId: string;

  @Field(() => School, { nullable: true })
  school: School;

  @Field({ nullable: true })
  districtId: string;

  @Field(() => District, { nullable: true })
  district: District;

  @Field({ nullable: true })
  courseId: string;

  @Field(() => Course, { nullable: true })
  course: Course;

  @Field(()=> User)
  user:   User;
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
