import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class BugReport {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  summary: string;

  @Field()
  issue: string;

  @Field()
  reproduce: string;

  @Field()
  consequence: string;

  @Field()
  user: User;

  @Field()
  phone: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
