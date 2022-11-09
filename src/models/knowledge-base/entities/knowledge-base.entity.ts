import { Field, ObjectType } from '@nestjs/graphql';
import { KnowledgeBaseType } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class KnowledgeBase {
  @Field(() => String)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => User)
  user: User;

  @Field()
  type: KnowledgeBaseType;

  @Field()
  isPublic: boolean;

  @Field(() => String, { nullable: true })
  title: string | null;

  @Field(() => String, { nullable: true })
  videoUrl: string | null;

  @Field(() => String, { nullable: true })
  articlePath: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt: Date | null;
}
