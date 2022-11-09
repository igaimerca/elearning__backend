import { Field, ObjectType } from '@nestjs/graphql';

import { File } from './file.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Files {
  @Field(() => [File])
  data: File[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
