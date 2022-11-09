import { Field, ObjectType } from '@nestjs/graphql';
import { EventRecurring } from '@prisma/client';

@ObjectType()
export class CalendarEvent {
  @Field()
  id: string;

  @Field()
  userId: string;

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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
