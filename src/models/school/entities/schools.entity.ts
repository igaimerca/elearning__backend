import { Field, ObjectType } from '@nestjs/graphql';

import { School } from './school.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Schools {
  @Field(() => [School])
  data: School[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
