import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateCourseInput {
  @Field(() => String)
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  picture: string;

  @Field()
  description: string;
}
