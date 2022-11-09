import { ObjectType, Field } from '@nestjs/graphql';
import { File } from '../../file/entities/file.entity';
import { User } from '../../users/entities/user.entity';
import { SharedFolder } from './sharedFolder.entity';

@ObjectType()
export class Folder {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  color: string;

  @Field({ nullable: true })
  parentFolderId: string;

  @Field({ nullable: true })
  isHidden: boolean | null;

  @Field(() => User)
  user: User;

  @Field(() => [SharedFolder], { nullable: true })
  sharedFolders: SharedFolder[];

  @Field(() => [Folder], { nullable: true })
  // eslint-disable-next-line no-use-before-define
  subFolders: Folder[];

  @Field(() => [File], { nullable: true })
  files: File[];

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
