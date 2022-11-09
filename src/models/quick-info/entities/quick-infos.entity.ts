import { Field, ObjectType } from '@nestjs/graphql';

import { QuickInfo } from './quick-info.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class QuickInfos {
  @Field(() => [QuickInfo])
  data: QuickInfo[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
