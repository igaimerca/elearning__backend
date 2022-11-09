import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Address {
  @Field(() => ID)
  id: string;

  @Field()
  country: string;

  @Field()
  state: string;

  @Field()
  city: string;

  @Field()
  street: string;

  @Field()
  number: number;

  @Field()
  zipCode: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
