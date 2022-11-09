import { Field, ObjectType } from '@nestjs/graphql';

import { User } from '../../users/entities/user.entity';
import { UserMessageGroup } from './group-message.entity';

@ObjectType()
export class UserToUserMessageGroup {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field()
  userMessageGroupId: string;

  @Field(() => UserMessageGroup)
  userMessageGroup: UserMessageGroup;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
