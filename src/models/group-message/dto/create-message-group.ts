import { Field, InputType } from '@nestjs/graphql';
import { Max } from 'class-validator';

@InputType()
export class CreateMessageGroupInput {
  @Field()
  @Max(15)
  name: string;

  @Field({ nullable: true })
  filePath: string;
}
