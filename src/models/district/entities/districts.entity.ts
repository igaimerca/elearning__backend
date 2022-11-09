import { Field, ObjectType } from '@nestjs/graphql';

import { District } from './district.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Districts {
  @Field(() => [District])
  data: District[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
