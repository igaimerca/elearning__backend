import { CreateAddressInput } from '../../address/dto/create-address.input';
import { InputType, Field } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@InputType()
export class CreateSchoolInput {
  @Field()
  name: string;

  @Field()
  districtId: string;

  @Field()
  address: CreateAddressInput;

  @Field(()=>GraphQLUpload,{ nullable: true })
  banner: GraphQLUpload;
}
