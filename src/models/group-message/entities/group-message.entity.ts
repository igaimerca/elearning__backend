import { Field, ObjectType } from '@nestjs/graphql';

import { User } from '../../users/entities/user.entity';
import { UserToUserMessageGroup } from './user-to-user-message-group.entity';

@ObjectType()
export class GroupMessage {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  filePath: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  messageGroupId: string;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class UserMessageGroup {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  filePath: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [UserToUserMessageGroup])
  users: UserToUserMessageGroup[];

  @Field(() => [GroupMessage])
  messages: GroupMessage[];
}
