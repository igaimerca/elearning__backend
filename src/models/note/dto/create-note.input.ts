import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateNoteInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  isPublic: boolean;
}
