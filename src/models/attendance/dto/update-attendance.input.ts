import { InputType, Field, PartialType } from '@nestjs/graphql';

import { CreateAttendanceInput } from './create-attendance.input';

@InputType()
export class UpdateAttendanceInput extends PartialType(CreateAttendanceInput) {
  @Field(() => String)
  id: string;
}
