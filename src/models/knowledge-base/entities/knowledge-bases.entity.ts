import { Field, ObjectType } from '@nestjs/graphql';

import { KnowledgeBase } from './knowledge-base.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class KnowledgeBases {
  @Field(() => [KnowledgeBase])
  data: KnowledgeBase[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
