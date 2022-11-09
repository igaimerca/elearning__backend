import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateLiveChatInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
