import { Field, ObjectType } from '@nestjs/graphql';
import { Schedule } from './schedule.entity';

@ObjectType()
export class scheduleByDay {
  @Field()
  day: number;

  @Field(()=>[Schedule])
  events: Schedule[];
}
