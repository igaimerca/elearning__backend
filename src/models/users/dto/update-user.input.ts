import { Field, InputType } from '@nestjs/graphql';
import { ProfileAvailability, Pronouns, Roles } from '@prisma/client';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@InputType()
export class UpdateUserInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  birthday: Date;

  @Field({ nullable: true })
  pronouns: Pronouns;

  @Field({ nullable: true })
  bio: string;

  @Field({ nullable: true })
  interests: string;

  @Field(()=>GraphQLUpload,{ nullable: true })
  profilePicture: GraphQLUpload;

  @Field(()=>GraphQLUpload,{ nullable: true })
  bannerPicture: GraphQLUpload;

  @Field({ nullable: true })
  removeBanner: boolean;

  @Field({ nullable: true })
  removeProfile: boolean;

  @Field()
  profileAvailability: ProfileAvailability;

  @Field({ nullable: true })
  role: Roles;
}
