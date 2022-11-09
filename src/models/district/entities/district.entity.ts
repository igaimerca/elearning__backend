import { Field, ID, ObjectType } from '@nestjs/graphql';

import { School } from '../../school/entities/school.entity';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../address/entities/address.entity';

@ObjectType()
export class District {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  addressId: string;

  @Field(() => Address)
  address: Address;

  @Field({ nullable: true })
  about: string;

  @Field({ nullable: true })
  banner: string;

  @Field({ nullable: true })
  logo: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [School], { nullable: true })
  schools: School[];

  @Field(() => [User], { nullable: true })
  users: User[];
}
