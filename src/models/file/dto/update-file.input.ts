import { CreateFileInput } from './create-file.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateFileInput extends PartialType(CreateFileInput) {
  @Field()
  id: string;
}
