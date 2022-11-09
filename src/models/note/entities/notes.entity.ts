import { Field, ObjectType } from '@nestjs/graphql';

import { Note } from './note.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Notes {
  @Field(() => [Note])
  data: Note[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
