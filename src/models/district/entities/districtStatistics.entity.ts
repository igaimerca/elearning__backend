import { Field, ObjectType } from '@nestjs/graphql';

import { District } from './district.entity';

@ObjectType()
export class DistrictStatistics extends District {
  @Field()
  PDACount: number;

  @Field()
  DACount: number;

  @Field()
  SACount: number;

  @Field()
  schoolCount: number;

  @Field()
  teacherCount: number;

  @Field()
  studentCount: number;

  @Field()
  parentCount: number;
}
