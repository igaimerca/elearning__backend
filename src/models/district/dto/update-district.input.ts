import { Field, InputType, PartialType } from '@nestjs/graphql';

import { CreateDistrictInput } from './create-district.input';

@InputType()
export class UpdateDistrictInput extends PartialType(CreateDistrictInput) {
  @Field()
  id: string;

  @Field({ nullable: true })
  removeBanner: boolean;

  @Field({ nullable: true })
  removeLogo: boolean;
}
