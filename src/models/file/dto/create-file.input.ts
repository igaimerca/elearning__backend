import { Field, InputType } from '@nestjs/graphql';
import { FileType } from '../../../common/enums/fileType.enum';

@InputType()
export class CreateFileInput {
  @Field({ nullable: true })
  name: string;

  @Field({defaultValue: FileType.UserDriveFile})
  fileType: FileType;

  @Field({ nullable: true })
  folderId: string | null;

}
