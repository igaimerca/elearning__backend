import { ObjectType, Field } from '@nestjs/graphql';

import { User } from '../../users/entities/user.entity';
import { Group } from './group.entity';

@ObjectType()
export class GroupUser {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field()
  groupId: string;

  @Field(() => Group)
  group: Group;

  @Field()
  moderator: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
