/* eslint-disable max-len */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { Action } from '../ability/ability.factory';
import { User } from '../users/entities/user.entity';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment.input';
import { Assignment } from './entities/assignment.entity';
import { Assignments } from './entities/assignments.entity';
import { AssignmentCompletion } from './entities/assignmentCompletion';
import { MonthlyAssignments } from './entities/assignments-monthly.enitity';

@Resolver(() => Assignment)
export class AssignmentResolver {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly assignmentService: AssignmentService) { }

  @Mutation(() => Assignment)
  @CheckAbilities({ action: Action.Create, subject: Assignment })
  createAssignment(
    @CurrentUser() user: User,
    @Args('createAssignmentInput') createAssignmentInput: CreateAssignmentInput,
  ) {
    return this.assignmentService.create(user, createAssignmentInput);
  }

  @Query(() => Assignment, { name: 'assignment' })
  findOne(@CurrentUser() user: User, @Args('id') id: string) {
    return this.assignmentService.findOne(user, id);
  }

  @Mutation(() => Assignment)
  updateAssignment(
    @CurrentUser() user: User,
    @Args('updateAssignmentInput') updateAssignmentInput: UpdateAssignmentInput,
  ) {
    return this.assignmentService.update(
      user,
      updateAssignmentInput.id,
      updateAssignmentInput,
    );
  }

  @Mutation(() => Assignment)
  removeAssignment(@CurrentUser() user: User, @Args('id') id: string) {
    return this.assignmentService.remove(user, id);
  }

  @Query(() => Assignments)
  async getParentCompletedAssignment(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return await this.assignmentService.getParentCompletedAssignment(
      user,
      skip,
      limit,
    );
  }

  @Query(() => Assignments)
  async getParentTodoAssignment(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return await this.assignmentService.getParentTodoAssignment(
      user,
      skip,
      limit,
    );
  }

  @Query(() => Assignments)
  async getParentOverDueAssignment(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return await this.assignmentService.getParentOverDueAssignment(
      user,
      skip,
      limit,
    );
  }

  @Query(() => Assignments)
  async getStudentTodoAssignments(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return await this.assignmentService.getStudentTodoAssignment(
      user,
      skip,
      limit,
    );
  }

  @Query(() => Assignments)
  async getStudentCompletedAssignments(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return await this.assignmentService.getStudentCompletedAssignments(
      user,
      skip,
      limit,
    );
  }

  @Query(() => Assignments)
  async getStudentOverDueAssignments(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return await this.assignmentService.getStudentOverDueAssignment(
      user,
      skip,
      limit,
    );
  }

  @Query(() => Assignments)
  async attachFolder(
    @CurrentUser() user: User,
    @Args('attachmentId') id: string,
    @Args('folderId') folderPath: string,
  ) {
    return await this.assignmentService.attachFolder(
      user,
      id,
      folderPath,
    );
  }

  @Query(() => AssignmentCompletion, {name: 'assignmentCompletion'})
  async getAssignmentCommpletionByCourse(
    @CurrentUser() user: User,
    @Args('courseId') courseId: string,
  ) {
    return await this.assignmentService.getAssignmentCompletionByCourse(
      user,
      courseId,
    );
  }

  @Query(() => Assignments, {
    name: 'getTeacherAssignments'
  })
  async getTeacherAssignments(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return await this.assignmentService.getAssignmentsByTeacher(
      user,
      skip,
      limit,
    );
  }

  @Query(() => AssignmentCompletion, { name: 'studentAssignmentCompletion' })
  async getStudentAssignmentCompletion(
    @CurrentUser() user: User,
  ) {
    return await this.assignmentService.getStudentAssignmentCompletion(user);
  }

  @Query(() => Assignments, {name:'studentAssignments'})
  async getStudentAssignments(
    @CurrentUser() user:User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
    ) {
    return await this.assignmentService.getStudentAssignments(user, skip, limit);
  }

  @Query(() => [MonthlyAssignments], { name: 'MonthlyAssignmentsReport' })
  async getMonthlyAssignmentsReport(
    @CurrentUser() user:User
  ) {
    return await this.assignmentService.getMonthlySchoolAssignments(user);
  }
}
