import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAddressInput {
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
}
