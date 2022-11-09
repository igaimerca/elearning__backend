import { Field, InputType } from '@nestjs/graphql';
import { Max } from 'class-validator';

@InputType()
export class CreateBugReportInput {
  @Field()
  title: string;

  @Field()
  @Max(250)
  summary: string;

  @Field()
  issue: string;

  @Field()
  reproduce: string;

  @Field()
  consequence: string;

  @Field()
  phone: string;

  @Field()
  email: string;
}
