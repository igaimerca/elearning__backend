import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Error {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
