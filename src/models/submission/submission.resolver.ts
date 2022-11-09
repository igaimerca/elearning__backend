import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';

import { SubmissionService } from './submission.service';
import { Submission } from './entities/submission.entity';
import { CreateSubmissionInput } from './dto/create-submission.input';
import { UpdateSubmissionInput } from './dto/update-submission.input';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { User } from '../users/entities/user.entity';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { Submissions } from './entities/submissions.entity';
import { CheckAbilities } from 'src/common/decorators/abilities.decorator';
import { Action } from '../ability/ability.factory';
import { CurrentUserToken } from 'src/common/decorators/currentUserToken.decorator';
import { SubmissionStatistics } from './entities/submissionStatistics.entity';
import { SubmissionGrades } from './entities/submission-grades.entity';

@Resolver(() => Submission)
export class SubmissionResolver {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly submissionService: SubmissionService) { }

  //  multiple attachment submission example in postman
  // operations => {"query":"mutation ($files:[Upload!]){\n createSubmission(createSubmissionInput:{assignmentId:\"cl5efx3hi0071u4d0sf1tgukn\",submitterId:\"cl56thk350085b8d0xtlcn34o\",attachments:$files}){\nid\nsubmissionAttachments{\nlinkToAttachment\n}}\n}", "variables": { "files": [null, null]}}
  // map => { "0": ["variables.files.0"], "1": ["variables.files.1"]}
  // 0 => Pick file
  // 1 => Pick file
  @Mutation(() => Submission)
  @CheckAbilities({ action: Action.Create, subject: Submission })
  async createSubmission(
    @Args('createSubmissionInput') createSubmissionInput: CreateSubmissionInput,
    @CurrentUser() user: User,
    @CurrentUserToken() token: string,
  ) {
    return await this.submissionService.create(
      user,
      createSubmissionInput,
      token,
    );
  }

  @Query(() => Submissions, { name: 'getSubmissions' })
  findAll(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.submissionService.findAll(user, skip, limit);
  }

  @Query(() => Submission, { name: 'getSubmission' })
  findOne(
    @CurrentUser() user: User,
    @Args('id', { type: () => Int }) id: string,
  ) {
    return this.submissionService.findOne(user, id);
  }

  @Query(() => Submissions)
  getAssignmentSubmissions(
    @CurrentUser() user: User,
    @Args('id', { description: 'Assignment id' }) id: string,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.submissionService.findAssignmentSubmissions(
      user,
      id,
      skip,
      limit,
    );
  }

  @Mutation(() => Submission)
  @CheckAbilities({ action: Action.Update, subject: Submission })
  updateSubmission(
    @CurrentUser() user: User,
    @Args('updateSubmissionInput') updateSubmissionInput: UpdateSubmissionInput,
    @CurrentUserToken() token: string,
  ) {
    return this.submissionService.update(
      user,
      updateSubmissionInput.id,
      updateSubmissionInput,
      token,
    );
  }

  @Mutation(() => Submission)
  addSubmissionComment(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @Args('comment') comment: string,
  ) {
    return this.submissionService.addComment(user, id, comment);
  }

  @Mutation(() => Submission)
  @CheckAbilities({ action: Action.Delete, subject: Submission })
  removeSubmission(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @CurrentUserToken() token: string,
  ) {
    return this.submissionService.remove(user, id, token);
  }

  @Query(() => [SubmissionStatistics], {
    name: 'weeklyStudentsAssignmentSubmissionStatistics',
  })
  findSchoolStatistics(
    @CurrentUser() user,
    @Args('schoolId', { type: () => String }) schoolId: string,
  ) {
    return this.submissionService.findWeeklySubmissionsBySchool(user, schoolId);
  }

  @Query(() => [SubmissionStatistics], {
    name: 'weeklyStudentsAssignmentSubmissions',
  })
  findWeeklySubmissions(
    @CurrentUser() user,
  ) {
    // eslint-disable-next-line max-len
    return this.submissionService.findWeeklyAssignmentSubmissionsByStudent(user);
  }


  @Query(() => [SubmissionGrades])
  getSubmssionsByCourse(
    @CurrentUser() user,
    @Args('courseId', { type: () => String }) courseId: string,
  ) {
    return this.submissionService.findSubmissionsByCourse(user, courseId);
  }
}
