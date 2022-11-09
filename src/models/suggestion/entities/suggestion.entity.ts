import { Field, ObjectType } from '@nestjs/graphql';
import { Length } from 'class-validator';
import { User } from 'src/models/users/entities/user.entity';

@ObjectType()
export class Suggestion {
  @Field()
  id: string;

  @Length(2, 100)
  @Field()
  title: string;

  @Length(2, 4000)
  @Field()
  description: string;

  @Field()
  read: boolean;

  @Field()
  starred: boolean;

  @Field(() => User)
  submitter: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  resolution: string;

  @Field()
  submitterId: string;
}
