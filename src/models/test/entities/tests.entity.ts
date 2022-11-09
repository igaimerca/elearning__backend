import { Field, ObjectType } from '@nestjs/graphql';
import { PageInfo } from 'src/models/pagination/entities/pageinfo.entity';
import { Test } from './test.entity';

@ObjectType()
export class Tests {
    @Field(() => [Test])
    data: Test[];

    @Field(() => PageInfo)
    pageInfo: PageInfo;
}
