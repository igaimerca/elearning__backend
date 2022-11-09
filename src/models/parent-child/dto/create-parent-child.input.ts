import { Field, InputType } from '@nestjs/graphql';

import { CreateAddressInput } from '../../address/dto/create-address.input';

@InputType()
export class CreateParentChildInput {
  @Field()
  parentId: string;

  @Field()
  childId: string;

  @Field()
  relationship: string;

  @Field()
  address: CreateAddressInput;
}
