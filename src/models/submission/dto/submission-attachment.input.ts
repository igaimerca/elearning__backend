import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SubmissionAttachmentInput {
  @Field()
  id: string;
}
