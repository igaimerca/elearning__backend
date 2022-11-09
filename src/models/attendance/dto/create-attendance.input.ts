import { InputType, Field } from '@nestjs/graphql';
import { AttendType } from '@prisma/client';

@InputType()
export class CreateAttendanceInput {
  @Field()
  courseId: string;

  @Field()
  userId: string;

  @Field()
  status: AttendType;

  @Field()
  day: Date;
}
