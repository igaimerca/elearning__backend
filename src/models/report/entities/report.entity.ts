import { Field, ObjectType } from '@nestjs/graphql';
import { ReadStatus } from '@prisma/client';

import { User } from '../../users/entities/user.entity';

@ObjectType()
class ReportAdminReads {
  @Field()
  status: ReadStatus;
}

@ObjectType()
export class Report {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  read: boolean;

  @Field()
  resolved: boolean;

  @Field()
  resolution: string;

  @Field()
  reporterId: string;

  @Field(() => User)
  reporter: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  reportAdminReads: ReportAdminReads;
}
