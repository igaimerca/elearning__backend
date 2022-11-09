import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class TransferGroupAdminInput {
  @Field()
  id: string;

  @Field()
  userId: string;
}
