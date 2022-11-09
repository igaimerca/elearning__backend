import { Field, ObjectType } from '@nestjs/graphql';
import { Submission } from './submission.entity';

@ObjectType()
export class SubmissionAttachment {
  @Field()
  id: string;

  @Field()
  submissionId: string;

  @Field(() => Submission)
  submission: Submission;

  @Field()
  linkToAttachment: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
