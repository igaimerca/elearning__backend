import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Assignment } from '../../assignment/entities/assignment.entity';
// eslint-disable-next-line max-len
import { SubmissionAttachment } from './submission-attachment.entity';

@ObjectType()
export class Submission {
  @Field()
  id: string;

  @Field()
  assignmentId: string;

  @Field(() => Assignment)
  assignment: Assignment;

  @Field()
  note: string;

  @Field()
  comment: string;

  @Field({ nullable: true })
  grade: number;

  @Field()
  submitterId: string;

  @Field(() => User)
  submitter: User;

  @Field(() => [SubmissionAttachment], { nullable: true })
  submissionAttachments: SubmissionAttachment[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
