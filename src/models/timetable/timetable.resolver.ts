/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */

import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateTimetableInput } from './dto/create-timetable.input';
import { UpdateTimetableInput } from './dto/update-timetable.input';
import { Timetable } from './entities/timetable.entity';
import { TimetableService } from './timetable.service';

@Resolver(() => Timetable)
export class TimetableResolver {
  constructor(private readonly timetableService: TimetableService) {}

  @Mutation(() => Timetable)
  createTimetable(
    @Args('createTimetableInput') createTimetableInput: CreateTimetableInput,
  ) {
    return this.timetableService.create(createTimetableInput);
  }

  @Query(() => [Timetable], { name: 'timetable' })
  findAll() {
    return this.timetableService.findAll();
  }

  @Query(() => Timetable, { name: 'timetable' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.timetableService.findOne(id);
  }

  @Mutation(() => Timetable)
  updateTimetable(
    @Args('updateTimetableInput') updateTimetableInput: UpdateTimetableInput,
  ) {
    return this.timetableService.update(
      updateTimetableInput.id,
      updateTimetableInput,
    );
  }

  @Mutation(() => Timetable)
  removeTimetable(@Args('id', { type: () => Int }) id: number) {
    return this.timetableService.remove(id);
  }
}
