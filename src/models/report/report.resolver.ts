/* eslint-disable no-unused-vars */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReadStatus } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateReportInput } from './dto/create-report.input';
import { Report } from './entities/report.entity';
import { Reports } from './entities/reports.entity';
import { ReportService } from './report.service';
import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { Action } from '../ability/ability.factory';

@Resolver(() => Report)
export class ReportResolver {
  constructor(private readonly reportService: ReportService) {}

  @Mutation(() => Report)
  @CheckAbilities({ action: Action.Create, subject: Report })
  createReport(
    @CurrentUser() user: User,
    @Args('createReportInput') createReportInput: CreateReportInput,
  ) {
    return this.reportService.create(user, createReportInput);
  }

  @Query(() => Reports, { name: 'reports' })
  @CheckAbilities({ action: Action.Read, subject: Report })
  findMany(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.reportService.findMany(user, skip, limit);
  }

  @Query(() => Report, { name: 'report' })
  @CheckAbilities({ action: Action.Read, subject: Report })
  async findOne(@CurrentUser() user: User, @Args('id') id: string) {
    return this.reportService.findOne(user, id);
  }

  @Mutation(() => Boolean)
  @CheckAbilities({ action: Action.Update, subject: Report })
  setAdminRead(@CurrentUser() user: User, @Args('id') id: string) {
    return this.reportService.setAdminReadStatus(user, id, ReadStatus.READ);
  }

  @Mutation(() => Boolean)
  @CheckAbilities({ action: Action.Update, subject: Report })
  setAdminUnread(@CurrentUser() user: User, @Args('id') id: string) {
    return this.reportService.setAdminReadStatus(user, id, ReadStatus.UNREAD);
  }
}
