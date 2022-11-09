import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateCalendarEventInput } from './create-calendarevent.input';

@InputType()
export class UpdateCalendarEventInput extends PartialType(
  CreateCalendarEventInput,
) {
  @Field()
  id: string;
}
