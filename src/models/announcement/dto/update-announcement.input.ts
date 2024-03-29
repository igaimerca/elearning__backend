import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateAnnouncementInput } from './create-announcement.input';

@InputType()
export class UpdateAnnouncementInput extends PartialType(
  CreateAnnouncementInput,
) {
  @Field()
  id: string;
}
