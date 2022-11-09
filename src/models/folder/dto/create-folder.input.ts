import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateFolderInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  color: string | null;

  @Field({ nullable: true })
  description: string | null;

  @Field({ nullable: true })
  parentFolderId: string | null;

  @Field({ nullable: true })
  isHidden: boolean | null;
}
