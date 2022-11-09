import { Field, ObjectType } from '@nestjs/graphql';

import { Submission } from './submission.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Submissions {
  @Field(() => [Submission])
  data: Submission[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
