import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAuditLogInput {
  @Field()
  userId: string;

  @Field()
  action: string;

  @Field()
  details: string;
}
