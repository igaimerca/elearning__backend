import { Field, InputType } from '@nestjs/graphql';
import { Max } from 'class-validator';

@InputType()
export class CreateQuickInfoInput {
  @Field({ nullable: true })
  @Max(50)
  title: string;

  @Field({ nullable: true })
  @Max(250)
  description: string;
}
