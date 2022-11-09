import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Notification {
  @Field(() => String)
  id: string;
  @Field(() => String)
  userId: string;
  @Field(() => String)
  notificationId: string;
  @Field(() => [String])
  @Field(() => String)
  title: string;
  @Field(() => String)
  description: string;
  @Field(() => String)
  NotificationType: string;
  @Field(() => String)
  targetedUser: string;
  @Field(() => String)
  linkToAttachment: string;
  @Field(() => String)
  image: string;
  @Field(() => String)
  announcementId: string;
}
