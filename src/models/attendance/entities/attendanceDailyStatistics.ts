import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AttendanceDailyStatistics {
    @Field()
    day: number;

    @Field()
    attendance: number;
}
