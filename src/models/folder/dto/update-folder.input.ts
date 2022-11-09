import { CreateFolderInput } from './create-folder.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateFolderInput extends PartialType(CreateFolderInput) {
  @Field()
  id: string;
}
