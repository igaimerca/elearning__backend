/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';

import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { CourseService } from './course.service';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { Course } from './entities/course.entity';
import { Courses } from './entities/courses.entity';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { CurrentUserToken } from '../../common/decorators/currentUserToken.decorator';
import { getNullableType } from 'graphql';
import { Action } from '../ability/ability.factory';
import { AverageCourseGrades } from './entities/course-statistics';
import { StudentToCourse } from './entities/student-to-course.entity';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}
  // example of operations field in postman
  // {"query":"mutation ($file:Upload!){\n createCourse(file:$file,createCourseInput:{name:\"test\",description:\"mbega urubwa\",teacherId:\"cl56thk2y0078b8d0d0ic6ml0\",schoolId:\"cl56thk220051b8d00apwv1wk\"}){\nid\nname\npicture\n}\n}", "variables": { "file": null }}

  // Create Course
  @Mutation(() => Course)
  @CheckAbilities({ action: Action.Create, subject: Course })
  createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
  ) {
    return this.courseService.createCourse(createCourseInput);
  }

  // Create Course With File
  @Mutation(() => Course)
  @CheckAbilities({ action: Action.Create, subject: Course })
  createCourseWithFile(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
    @CurrentUserToken() token: string,
    @CurrentUser() user: User,
    @Args({ name: 'file', type: () => GraphQLUpload }) file,
  ) {
    return this.courseService.createCourse(createCourseInput,token,user,file);
  }

  // Get Single Course
  @Query(() => Course, { name: 'course' })
  getCourse(@CurrentUser() user: User, @Args('id') id: string) {
    return this.courseService.getSingleCourse(user, id);
  }

  // Get All Courses
  @Query(() => Courses, { name: 'courses' })
  getAllCourses(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.courseService.getAllCourses(user, skip, limit);
  }

  // Get count of courses taught in school
  @Query(() => Number)
  getCountCoursesOfSchool(
    @CurrentUser() user: User,
    @Args('schoolId') schoolId: string,
  ) {
    return this.courseService.countCoursesOfSchool(schoolId, user);
  }

  // Update Course
  @Mutation(() => Course)
  updateCourse(
    @CurrentUser() user: User,
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
  ) {
    return this.courseService.updateCourse(user, updateCourseInput);
  }

  // Update With File
  @Mutation(() => Course)
  updateCourseWithFile(
    @CurrentUser() user: User,
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
    @CurrentUserToken() token: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file,
  ) {
    return this.courseService.updateCourse(user, updateCourseInput,token,file);
  }

  // Delete Course
  @Mutation(() => Course)
  deleteCourse(@CurrentUser() user: User, @Args('id') id: string,@CurrentUserToken() token: string) {
    return this.courseService.deleteCourse(user, id,token);
  }

  // Enroll Student
  @Mutation(() => StudentToCourse)
  enrollStudent(
    @CurrentUser() user: User,
    @Args('courseCode') courseCode: string,
    @Args('studentId') studentId: string,
  ) {
    return this.courseService.enrollStudent(user, courseCode, studentId);
  }

  @Query(() => AverageCourseGrades, {
    name: 'averageGradePerCourse'
  })

  //To-Do
  /*averageCourseGrades(
    @CurrentUser() user:User,
    @Args('courseId') courseId: string,
  ) {
    return this.courseService.findAverageCourseGrade(user,courseId);
  }
*/
  @Query(() => Courses, { name: 'getCoursesByTeacher' })
  getCoursesByTeacher(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.courseService.findCoursesOfTeacher(user, skip, limit);
  }
  // Remove Student
  @Mutation(() => StudentToCourse)
  removeStudentFromCourse(
    @CurrentUser() user: User,
    @Args('courseCode') courseCode: string,
    @Args('studentId') studentId: string,
  ) {
    return this.courseService.removeStudent(user, courseCode, studentId);
  }

  @Query(() => Courses, { name: 'getStudentCourses' })
  getCoursesByStudent(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.courseService.findCoursesOfStudent(user, skip, limit);
  }
}
