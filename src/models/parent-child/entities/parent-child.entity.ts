import { Field, ObjectType } from '@nestjs/graphql';

import { User } from '../../users/entities/user.entity';
import { Address } from '../../address/entities/address.entity';

@ObjectType()
export class ParentChild {
  @Field()
  id: string;

  @Field()
  parentId: string;

  @Field()
  childId: string;

  @Field(() => User)
  parent: User;

  @Field(() => User)
  child: User;

  @Field()
  relationship: string;

  @Field(() => Address)
  address: Address;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
