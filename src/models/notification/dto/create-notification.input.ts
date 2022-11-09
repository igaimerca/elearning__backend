import { InputType, Int, Field } from '@nestjs/graphql';
import { NotificationType, TargetType } from '@prisma/client';
@InputType()
export class CreateNotificationInput {
    @Field(() => String, { nullable: true })
    userId: string;

    @Field(() => Int, { nullable: true })
    groupId: number;

    @Field(() => String)
    targetedUser: TargetType;

    @Field(() => String)
    title: string;

    @Field(() => String)
    description: string;

    @Field(() =>String, { nullable: true })
    courseId: string;

    @Field(() => String, { nullable: true })
    announcementId: string;

    @Field(() => String)
    NotificationType: NotificationType;

    @Field(() => String, { nullable: true })
    link: string;

    @Field(() => String, { nullable: true })
    image: string;
}
