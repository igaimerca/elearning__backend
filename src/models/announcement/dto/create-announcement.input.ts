import { Field, InputType } from '@nestjs/graphql';
import { Max } from 'class-validator';

@InputType()
export class CreateAnnouncementInput {
  @Field()
  @Max(100)
  title: string;

  @Field()
  @Max(400)
  description: string;

  @Field({ nullable: true })
  courseId: string;

  @Field({ nullable: true })
  @Max(100)
  userId: string;
}
