import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SubmissionStatistics {
  @Field()
  day: number;

  @Field()
  totalAssignmentSubmissions: number;
}
