import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Timetable {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
