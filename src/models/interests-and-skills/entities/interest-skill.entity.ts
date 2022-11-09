import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InterestOrSkill {
    @Field()
    id: string;

    @Field()
    userId: string;

    @Field()
    title: string;
}
