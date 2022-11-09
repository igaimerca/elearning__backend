import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateReportInput } from './create-report.input';

@InputType()
export class UpdateReportInput extends PartialType(CreateReportInput) {
  @Field()
  id: string;
}
