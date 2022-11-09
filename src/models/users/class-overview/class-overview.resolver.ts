/* eslint-disable no-unused-vars */
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { ClassOverviewService } from './class-overview.service';
import { ClassOverview } from './entities/class-overview.entity';
import { User } from '../entities/user.entity';
@Resolver(() => [ClassOverview])
export class ClassOverviewResolver {
  constructor(private readonly classOverviewService: ClassOverviewService) { }
  @Query(() => [ClassOverview])
  // eslint-disable-next-line max-len
  async getClassOverview(@Args('studentId') studentId: string, @CurrentUser() user: User) {
    return await this.classOverviewService.studentOverview(user, studentId);
  }
}
