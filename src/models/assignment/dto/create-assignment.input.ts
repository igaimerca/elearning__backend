import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAssignmentInput {
  @Field()
  courseId: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  due: Date;

  @Field({ defaultValue: 100 })
  marks: number;

  @Field()
  visible: boolean;

  @Field()
  folderPath: string;
}
