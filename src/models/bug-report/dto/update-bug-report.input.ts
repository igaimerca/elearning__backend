import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateBugReportInput } from './create-bug-report.input';

@InputType()
export class UpdateBugReportInput extends PartialType(CreateBugReportInput) {
  @Field()
  id: string;
}
