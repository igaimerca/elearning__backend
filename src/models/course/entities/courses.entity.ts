import { Field, ObjectType } from '@nestjs/graphql';

import { PageInfo } from '../../pagination/entities/pageinfo.entity';
import { Course } from './course.entity';

@ObjectType()
export class Courses {
  @Field(() => [Course])
  data: Course[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
