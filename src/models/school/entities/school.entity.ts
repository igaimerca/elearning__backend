import { Field, ObjectType } from '@nestjs/graphql';
import { Announcement } from '../../announcement/entities/announcement.entity';
import { District } from '../../district/entities/district.entity';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../address/entities/address.entity';

@ObjectType()
export class School {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  districtId: string;

  @Field(() => District)
  district: District;

  @Field(() => [User], { nullable: true })
  users: User[];

  @Field(() => [Announcement], { nullable: true })
  announcements: Announcement[];

  @Field()
  addressId: string;

  @Field({ nullable: true })
  banner: string;

  @Field(() => Address)
  address: Address;
}
