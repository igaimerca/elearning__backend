import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { File } from './file.entity';

@ObjectType()
export class SharedFile {
  @Field()
  id: string;

  @Field()
  sharedWithId: string;

  @Field(() => User, { nullable: true })
  sharedWith: User;

  @Field()
  fileId: string;

  @Field(() => File, { nullable: true })
  file: File;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
