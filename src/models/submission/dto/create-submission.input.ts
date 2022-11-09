import { InputType, Field } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@InputType()
export class CreateSubmissionInput {
  @Field()
  assignmentId: string;

  @Field(() => [GraphQLUpload], { nullable: true })
  attachments: GraphQLUpload[];

  @Field({ nullable: true })
  note: string;

  @Field({ nullable: true })
  comment: string;

  @Field({ nullable: true })
  grade: number;

  @Field()
  submitterId: string;
}
