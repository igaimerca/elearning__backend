import { Field, ObjectType } from '@nestjs/graphql';

import { Announcement } from './announcement.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class Announcements {
  @Field(() => [Announcement])
  data: Announcement[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
