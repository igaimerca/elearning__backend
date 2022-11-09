import { Field, ObjectType } from '@nestjs/graphql';

import { PageInfo } from '../../pagination/entities/pageinfo.entity';
import { DistrictStatistics } from './districtStatistics.entity';

@ObjectType()
export class DistrictsStatistics {
  @Field(() => [DistrictStatistics])
  data: DistrictStatistics[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
