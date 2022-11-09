import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ScheduleService } from './schedule.service';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleInput } from './dto/create-schedule.input';
import { UpdateScheduleInput } from './dto/update-schedule.input';
import { CheckAbilities } from 'src/common/decorators/abilities.decorator';
import { Action } from '../ability/ability.factory';
import { scheduleByDay } from './entities/scheduleByDay.entity';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { User } from '../users/entities/user.entity';
import { Day } from 'src/common/enums/fileType.enum copy';

@Resolver(() => Schedule)
export class ScheduleResolver {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Mutation(() => Schedule)
  createSchedule(
    @CurrentUser() user: User,
    @Args('createScheduleInput') createScheduleInput: CreateScheduleInput,
  ) {
    return this.scheduleService.create(user, createScheduleInput);
  }

  @Mutation(() => Schedule)
  updateSchedule(
    @CurrentUser() user: User,
    @Args('updateScheduleInput') updateScheduleInput: UpdateScheduleInput,
  ) {
    return this.scheduleService.update(user, updateScheduleInput);
  }

  @Query(() => [scheduleByDay], { name: 'schedulesByDays' })
  findSchedule(
    @CurrentUser() user: User,
    @Args('day', { nullable: true }) day: Day,
  ) {
    return this.scheduleService.findByDay(user, day);
  }

  @Query(() => [Schedule], { name: 'studentSchedules' })
  findShcheduleByStudent(
    @CurrentUser() user: User,
  ) {
    return this.scheduleService.findByStudent(user);
  }
}
