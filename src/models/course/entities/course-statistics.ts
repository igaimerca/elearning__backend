import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AverageCourseGrades {
    @Field()
    course: string;

    @Field()
    percentage: number;
}
