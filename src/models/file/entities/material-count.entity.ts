import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MaterialCount{
    @Field()
    count:number;
}
