import { Field, ObjectType } from '@nestjs/graphql';

import { Suggestion } from './suggestion.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Suggestions {
  @Field(() => [Suggestion])
  data: Suggestion[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
