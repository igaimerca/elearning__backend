import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class CreateAdminInput {
  @Field()
  @IsEmail()
  email: string;
}
