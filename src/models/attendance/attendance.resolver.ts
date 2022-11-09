/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AttendType } from '@prisma/client';

import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { Action } from '../ability/ability.factory';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceInput } from './dto/create-attendance.input';
// eslint-disable-next-line max-len
import { CreateManyAttendancesInput } from './dto/create-many-attendances.input';
import { UpdateAttendanceInput } from './dto/update-attendance.input';
import { Attendance } from './entities/attendance.entity';
import { AttendanceDailyStatistics } from './entities/attendanceDailyStatistics';
import { Attendances } from './entities/attendances.entity';
import { AttendanceStatistics } from './entities/attendanceStatistics.entity';
import { StudentAttendance } from './entities/studentAttendance.entity';

@Resolver(() => Attendance)
export class AttendanceResolver {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Mutation(() => Attendance)
  @CheckAbilities({ action: Action.Create, subject: Attendance })
  createAttendance(
    @CurrentUser() user,
    @Args('createAttendanceInput') createAttendanceInput: CreateAttendanceInput,
  ) {
    return this.attendanceService.create(user, createAttendanceInput);
  }

  @Mutation(() => [Attendance])
  @CheckAbilities({ action: Action.Create, subject: Attendance })
  createManyAttendances(
    @CurrentUser() user,
    @Args('createManyAttendancesInput')
    createManyAttendancesInput: CreateManyAttendancesInput,
  ) {
    return this.attendanceService.createMany(user, createManyAttendancesInput);
  }

  @Query(() => Attendances, { name: 'attendances' })
  findMany(
    @CurrentUser() user,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.attendanceService.findMany(user, skip, limit);
  }

  @Query(() => Attendances, { name: 'attendancesbyday' })
  findManyByDay(
    @CurrentUser() user,
    @Args('day', { type: () => Date }) day: Date,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.attendanceService.findManyByDay(user, day, skip, limit);
  }

  @Query(() => Attendances, { name: 'attendancesbycourse' })
  findManyByCourse(
    @CurrentUser() user,
    @Args('courseId', { type: () => String }) courseId: string,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.attendanceService.findManyByCourse(user, courseId, skip, limit);
  }

  @Query(() => [AttendanceStatistics], {
    name: 'attendanceStatisticsByDistrict',
  })
  findDistrictStatistics(
    @CurrentUser() user,
    @Args('districtId', { type: () => String }) districtId: string,
    @Args('status', { defaultValue: AttendType.PRESENT }) status: AttendType,
  ) {
    return this.attendanceService.findManyByDistrict(user, districtId, status);
  }

  @Query(() => [AttendanceStatistics], {
    name: 'attendanceStatisticsBySchool',
  })
  findSchoolStatistics(
    @CurrentUser() user,
    @Args('schoolId', { type: () => String }) schoolId: string,
    @Args('status', { defaultValue: AttendType.PRESENT }) status: AttendType,
  ) {
    return this.attendanceService.findManyBySchool(user, schoolId, status);
  }

  @Query(() => Attendance, { name: 'attendance' })
  findOne(@CurrentUser() user, @Args('id', { type: () => String }) id: string) {
    return this.attendanceService.findOne(user, id);
  }

  @Mutation(() => Attendance)
  updateAttendance(
    @CurrentUser() user,
    @Args('updateAttendanceInput') updateAttendanceInput: UpdateAttendanceInput,
  ) {
    return this.attendanceService.update(user, updateAttendanceInput);
  }

  //studentsListWithAverageGradeMissingAssignmentsPresentCountTardyAbsentCount
  @Query(() => [StudentAttendance], { name: 'studentsListWithAverageGradeMissingAssignmentsPresentCountTardyAbsentCount' })
  findStudentsListWithAverageGradeMissingAssignmentsPresentCountTardyAbsentCount(
    @Args('courseId', { type: () => String }) courseId: string,
    @CurrentUser() user,
  ) {
    return this.attendanceService.studentsListWithAverageGradeMissingAssignmentsPresentCountTardyAbsentCount(user, courseId);
  }

  @Query(() => [AttendanceDailyStatistics], {
    name: 'courseAttendanceDailyStatistics',
  })
  findCourseStatistics(
    @CurrentUser() user,
    @Args('courseId', {type:()=>String}) courseId: string,
  ) {
    // eslint-disable-next-line max-len
    return this.attendanceService.findDailyCourseAttendance(user, courseId);
  }
}
