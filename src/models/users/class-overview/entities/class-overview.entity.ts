import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ClassOverview {
    @Field()
    courseId: string;
    @Field()
    courseName: string;
    @Field({ nullable: true })
    coursePicture: string;
    @Field()
    teacherName: string;
    averageGrade: string;
    @Field()
    missingAssignments: string;
    @Field()
    classStartTime: string;
    @Field()
    classEndTime: string;
}
