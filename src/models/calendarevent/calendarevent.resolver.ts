import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { User } from '../users/entities/user.entity';
import { CalendarEventService } from './calendarevent.service';
import { CreateCalendarEventInput } from './dto/create-calendarevent.input';
import { UpdateCalendarEventInput } from './dto/update-calendarevent.input';
import { CalendarEvent } from './entities/calendarevent.entity';
import { CalendarEvents } from './entities/calendarevents.entity';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { Action } from '../ability/ability.factory';

@Resolver(() => CalendarEvent)
export class CalendarEventResolver {
  constructor(private readonly calendarEventService: CalendarEventService) {}

  @Mutation(() => CalendarEvent)
  @CheckAbilities({ action: Action.Create, subject: CalendarEvent })
  createCalendarEvent(
    @CurrentUser() user: User,
    @Args('createCalendarEventInput')
    createCalendarEventInput: CreateCalendarEventInput,
  ) {
    return this.calendarEventService.createCalendarEvent(
      createCalendarEventInput,
      user,
    );
  }

  @Query(() => CalendarEvents, { name: 'calendarevents' })
  findMany(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.calendarEventService.findMany(user, skip, limit);
  }

  @Query(() => CalendarEvent, { name: 'calendarevent' })
  findOne(@CurrentUser() user: User, @Args('id') id: string) {
    return this.calendarEventService.findOne(user, id);
  }

  @Mutation(() => CalendarEvent)
  updateCalendarEvent(
    @CurrentUser() user: User,
    @Args('updateCalendarEventInput')
    updateCalendarEventInput: UpdateCalendarEventInput,
  ) {
    return this.calendarEventService.updateCalendarEvent(
      updateCalendarEventInput,
      user,
    );
  }

  @Mutation(() => CalendarEvent)
  removeCalendarEvent(@CurrentUser() user: User, @Args('id') id: string) {
    return this.calendarEventService.removeCalendarEvent(id, user);
  }
}
