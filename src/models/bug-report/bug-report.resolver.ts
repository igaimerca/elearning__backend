import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { BugReportService } from './bug-report.service';
import { CreateBugReportInput } from './dto/create-bug-report.input';
import { UpdateBugReportInput } from './dto/update-bug-report.input';
import { BugReport } from './entities/bug-report.entity';
import { BugReports } from './entities/bug-reports.entity';
import { Action } from '../ability/ability.factory';

@Resolver(() => BugReport)
export class BugReportResolver {
  constructor(private readonly bugReportService: BugReportService) {}

  @Mutation(() => BugReport)
  @CheckAbilities({ action: Action.Create, subject: BugReport })
  createBugReport(
    @CurrentUser() user: User,
    @Args('createBugReportInput') createBugReportInput: CreateBugReportInput,
  ) {
    return this.bugReportService.create(user, createBugReportInput);
  }

  @Query(() => BugReports, { name: 'bugReports' })
  @CheckAbilities({ action: Action.Read, subject: BugReport })
  findMany(
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.bugReportService.findMany(skip, limit);
  }

  @Query(() => BugReport, { name: 'bugReport' })
  @CheckAbilities({ action: Action.Read, subject: BugReport })
  findOne(@Args('id') id: string) {
    return this.bugReportService.findOne(id);
  }

  @Mutation(() => BugReport)
  @CheckAbilities({ action: Action.Update, subject: BugReport })
  updateBugReport(
    @Args('updateBugReportInput') updateBugReportInput: UpdateBugReportInput,
  ) {
    return this.bugReportService.update(
      updateBugReportInput.id,
      updateBugReportInput,
    );
  }

  @Mutation(() => BugReport)
  @CheckAbilities({ action: Action.Delete, subject: BugReport })
  removeBugReport(@CurrentUser() user: User, @Args('id') id: string) {
    return this.bugReportService.remove(user, id);
  }
}
