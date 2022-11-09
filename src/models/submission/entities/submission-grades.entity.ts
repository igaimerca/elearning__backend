import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SubmissionGrades {
    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field()
    profilePicture: string;


    @Field()
    marks: number;

    @Field()
    grade: string;
}


