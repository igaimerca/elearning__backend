import { Field, ObjectType } from '@nestjs/graphql';

import { BugReport } from './bug-report.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class BugReports {
  @Field(() => [BugReport])
  data: BugReport[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
