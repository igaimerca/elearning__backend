import { Field, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class StudentAttendance {
  @Field()
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  profilePicture: string;
  @Field()
  averageGrade: number;

  @Field()
  missedAssignments: number;

  @Field()
  present: number;

  @Field()
  tardy: number;

  @Field()
  absent: number;
}
