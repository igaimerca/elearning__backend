import { ObjectType, Field } from '@nestjs/graphql';

import { User } from '../../users/entities/user.entity';
import { GroupUser } from './groupuser.entity';

@ObjectType()
export class Group {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  photo: string;

  @Field()
  adminId: string;

  @Field(() => User)
  admin: User;

  @Field(() => [GroupUser], { nullable: true })
  members: GroupUser[];

  @Field()
  confidential: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
