import { CreateTimetableInput } from './create-timetable.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTimetableInput extends PartialType(CreateTimetableInput) {
  @Field(() => Int)
  id: number;
}
