import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Settings {
  @Field()
  userId: string;

  @Field()
  darkMode: boolean;

  @Field()
  textSize: number;
}
