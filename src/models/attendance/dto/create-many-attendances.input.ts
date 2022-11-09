import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateManyAttendancesInput {
  @Field()
  courseId: string;

  @Field(() => [String])
  userIds: string[];

  @Field()
  day: Date;
}
