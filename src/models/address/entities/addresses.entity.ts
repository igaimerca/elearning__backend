import { Field, ObjectType } from '@nestjs/graphql';

import { Address } from './address.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Addresses {
  @Field(() => [Address])
  data: Address[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
