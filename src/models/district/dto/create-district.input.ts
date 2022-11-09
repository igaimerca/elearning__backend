import { Field, InputType } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { CreateAddressInput } from '../../address/dto/create-address.input';

@InputType()
export class CreateDistrictInput {
  @Field()
  name: string;

  @Field()
  address: CreateAddressInput;

  @Field({ nullable: true })
  daLicenses: number;

  @Field({ nullable: true })
  saLicenses: number;

  @Field({ nullable: true })
  schoolLicenses: number;

  @Field({ nullable: true })
  teacherLicenses: number;

  @Field({ nullable: true })
  studentLicenses: number;

  @Field({ nullable: true })
  parentLicenses: number;

  @Field({ nullable: true })
  psaLicences: number;

  @Field({ nullable: true })
  about: string;

  @Field(()=>GraphQLUpload,{ nullable: true })
  banner: GraphQLUpload;

  @Field(()=>GraphQLUpload,{ nullable: true })
  logo: GraphQLUpload;
}
