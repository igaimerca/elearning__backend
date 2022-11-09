import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DistrictGradeStatistics {
    @Field()
    month:number;

    @Field()
    percentage:number;
}
