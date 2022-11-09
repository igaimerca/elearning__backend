import { InputType,Field } from '@nestjs/graphql';
@InputType()
export class CreateDailyEmailNotificationInput {
   @Field(() => String, { nullable: false})
   updateDetails: string;
}
