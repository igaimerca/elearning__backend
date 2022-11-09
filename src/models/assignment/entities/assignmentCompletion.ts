import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AssignmentCompletion {
    @Field()
    Completed: number;

    @Field()
    Incomplete: number;
}
