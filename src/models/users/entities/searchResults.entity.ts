import { Field, ObjectType } from '@nestjs/graphql';

import { PageInfo } from '../../pagination/entities/pageinfo.entity';
import { SearchResult } from './searchResult.entity';

@ObjectType()
export class SearchResults {
  @Field(() => [SearchResult])
  data: SearchResult[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
