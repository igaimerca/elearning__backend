import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateTimetableInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
