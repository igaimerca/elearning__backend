import { Field, InputType } from '@nestjs/graphql';
import { Length, Max } from 'class-validator';

@InputType()
export class CreateSuggestionInput {
  @Length(2, 100)
  @Field()
  @Max(100)
  title: string;

  @Length(2, 4000)
  @Field()
  @Max(4000)
  description: string;

  @Field()
  read: boolean;

  @Field()
  starred: boolean;
}
