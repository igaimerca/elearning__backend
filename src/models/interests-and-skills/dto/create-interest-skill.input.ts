import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateInterestOrSkillInput {
    @Field()
    title: string;
}
