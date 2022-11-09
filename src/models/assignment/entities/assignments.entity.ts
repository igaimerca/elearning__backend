import { Field, ObjectType } from '@nestjs/graphql';

import { Assignment } from './assignment.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Assignments {
  @Field(() => [Assignment])
  data: Assignment[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
