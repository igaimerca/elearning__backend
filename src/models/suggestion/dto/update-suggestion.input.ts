import { Field, InputType, PartialType } from '@nestjs/graphql';
import { Min } from 'class-validator';
import { CreateSuggestionInput } from './create-suggestion.input';

@InputType()
export class UpdateSuggestionInput extends PartialType(CreateSuggestionInput) {
  @Field()
  id: string;

  @Field({ nullable: true })
  @Min(20)
  resolution: string;
}
