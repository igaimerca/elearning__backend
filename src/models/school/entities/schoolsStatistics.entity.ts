import { Field, ObjectType } from '@nestjs/graphql';

import { PageInfo } from '../../pagination/entities/pageinfo.entity';
import { SchoolStatistics } from './schoolStatistics.entity';

@ObjectType()
export class SchoolsStatistics {
  @Field(() => [SchoolStatistics])
  data: SchoolStatistics[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
