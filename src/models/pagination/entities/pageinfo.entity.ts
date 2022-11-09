import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
  @Field()
  total: number;

  @Field()
  skip: number;

  @Field()
  limit: number;
}
