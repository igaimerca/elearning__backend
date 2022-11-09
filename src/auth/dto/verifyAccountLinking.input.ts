import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class VerifyAccountLinkingInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  token: string;

  @Field()
  linkId: string;
}
