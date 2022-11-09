import { ObjectType, Field } from '@nestjs/graphql';
import { Folder } from '../../folder/entities/folder.entity';
import { User } from 'src/models/users/entities/user.entity';
import { SharedFile } from './sharedFile.entity';

@ObjectType()
export class File {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  size: string;

  @Field()
  filePath: string;

  @Field({ nullable: true })
  folderId: string;

  @Field(() => Folder, { nullable: true })
  folder: Folder;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field(() => [SharedFile], { nullable: true })
  sharedFiles: SharedFile[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
