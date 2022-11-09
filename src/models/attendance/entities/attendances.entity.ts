import { Field, ObjectType } from '@nestjs/graphql';

import { Attendance } from './attendance.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Attendances {
  @Field(() => [Attendance])
  data: Attendance[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
