import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class EnableTfaInput {
  @Field()
  @IsEmail()
  tfaCode: string;
}
