import { Field, ObjectType } from '@nestjs/graphql';

import { School } from './school.entity';

@ObjectType()
export class SchoolStatistics extends School {
  @Field()
  studentCount: number;

  @Field()
  teacherCount: number;

  @Field()
  parentCount: number;
}
