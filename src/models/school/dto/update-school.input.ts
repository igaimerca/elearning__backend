import { CreateSchoolInput } from './create-school.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateSchoolInput extends PartialType(CreateSchoolInput) {
  @Field()
  id: string;
}
