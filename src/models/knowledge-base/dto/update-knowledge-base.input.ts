import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateKnowledgeBaseInput } from './create-knowledge-base.input';

@InputType()
export class UpdateKnowledgeBaseInput extends PartialType(
  CreateKnowledgeBaseInput,
) {
  @Field()
  id: string;

  @Field({ nullable: true })
  isPublic: boolean;
}
