import { Field, ObjectType } from '@nestjs/graphql';

import { Report } from './report.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Reports {
  @Field(() => [Report])
  data: Report[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
