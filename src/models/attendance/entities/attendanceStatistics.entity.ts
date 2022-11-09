import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AttendanceStatistics {
  @Field()
  month: number;

  @Field()
  percentage: number;
}
