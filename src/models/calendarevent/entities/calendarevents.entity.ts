import { Field, ObjectType } from '@nestjs/graphql';

import { CalendarEvent } from './calendarevent.entity';
import { PageInfo } from '../../pagination/entities/pageinfo.entity';

@ObjectType()
export class CalendarEvents {
  @Field(() => [CalendarEvent])
  data: CalendarEvent[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
