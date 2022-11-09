import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Folder } from './folder.entity';

@ObjectType()
export class SharedFolder {
  @Field()
  id: string;

  @Field()
  sharedWithId: string;

  @Field(() => User, { nullable: true })
  sharedWith: User;

  @Field()
  folderId: string;

  @Field(() => Folder, { nullable: true })
  folder: Folder;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
