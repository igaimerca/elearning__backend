import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginAuthInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  tfactorAuthCode?: string;
}
