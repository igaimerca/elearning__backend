import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Note {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  isPinned: boolean;

  @Field()
  isPublic: boolean;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
