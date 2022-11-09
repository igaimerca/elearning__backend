import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class AuditLog {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  action: string;

  @Field()
  details: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
