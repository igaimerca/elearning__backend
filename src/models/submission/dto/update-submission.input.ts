import { CreateSubmissionInput } from './create-submission.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { SubmissionAttachmentInput } from './submission-attachment.input';

@InputType()
export class UpdateSubmissionInput extends PartialType(CreateSubmissionInput) {
  @Field()
  id: string;

  @Field(() => [SubmissionAttachmentInput], { nullable: true })
  attachmentsToDelete: SubmissionAttachmentInput[];
}
