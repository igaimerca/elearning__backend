import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MonthlyAssignments {
    @Field()
    month: number;

    @Field()
    assignments: number;
}
