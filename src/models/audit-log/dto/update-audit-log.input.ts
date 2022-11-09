import { CreateAuditLogInput } from './create-audit-log.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAuditLogInput extends PartialType(CreateAuditLogInput) {
  @Field(() => Int)
  id: number;
}
