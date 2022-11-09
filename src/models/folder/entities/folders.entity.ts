import { Field, ObjectType } from '@nestjs/graphql';

import { Folder } from './folder.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Folders {
  @Field(() => [Folder])
  data: Folder[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
