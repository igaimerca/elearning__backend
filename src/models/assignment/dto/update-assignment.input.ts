import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateAssignmentInput } from './create-assignment.input';

@InputType()
export class UpdateAssignmentInput extends PartialType(CreateAssignmentInput) {
  @Field()
  id: string;
}
