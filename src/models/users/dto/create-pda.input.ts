import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class CreatePdaInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  districtId: string;
}
