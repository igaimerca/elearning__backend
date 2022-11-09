import { Field, ObjectType } from '@nestjs/graphql';

import { PageInfo } from '../../pagination/entities/pageinfo.entity';
import { User } from './user.entity';

@ObjectType()
export class Users {
  @Field(() => [User])
  data: User[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
