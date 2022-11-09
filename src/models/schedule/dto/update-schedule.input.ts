import { CreateScheduleInput } from './create-schedule.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateScheduleInput extends PartialType(CreateScheduleInput) {
  @Field()
  id: string;
}
