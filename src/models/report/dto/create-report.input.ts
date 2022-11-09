import { Field, InputType } from '@nestjs/graphql';
import { Max } from 'class-validator';

@InputType()
export class CreateReportInput {
  @Field()
  @Max(100)
  title: string;

  @Field()
  @Max(8000)
  description: string;

  @Field()
  read: boolean;

  @Field()
  resolved: boolean;

  @Field()
  @Max(200)
  resolution: string;
}
