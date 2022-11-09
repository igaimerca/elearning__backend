import { Field, InputType } from '@nestjs/graphql';
import { EventRecurring } from '@prisma/client';

@InputType()
export class CreateCalendarEventInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field({ nullable: true })
  recurring: EventRecurring;

  @Field({ nullable: true })
  recurringDate: Date;
}
