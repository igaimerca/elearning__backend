import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Message {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  filePath: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field()
  toId: string;

  @Field()
  fromId: string;

  @Field(() => User)
  to: User;

  @Field(() => User)
  from: User;
}
