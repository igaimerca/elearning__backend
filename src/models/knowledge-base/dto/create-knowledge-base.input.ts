import { Field, InputType } from '@nestjs/graphql';
import { KnowledgeBaseType } from '@prisma/client';

@InputType()
export class CreateKnowledgeBaseInput {
  @Field()
  type: KnowledgeBaseType;

  @Field({ nullable: true })
  title: string | null;

  @Field({ nullable: true })
  videoUrl: string | null;

  @Field({ nullable: true })
  articlePath: string | null;
}
