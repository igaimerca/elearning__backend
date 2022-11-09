import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCourseInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  picture: string;

  @Field()
  description: string;

  @Field()
  teacherId: string;

  @Field()
  schoolId: string;
}
