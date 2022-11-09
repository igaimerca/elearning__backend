/* eslint-disable no-unused-vars */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { CreateAdminInput } from './dto/create-admin.input';
import { CreatePdaInput as CreateDistrictInput } from './dto/create-pda.input';
import { EnableTfaInput } from './dto/enable-tfa.input';
import { CreateResponse } from './entities/createResponse.entity';
import { SetupTfaResponse } from './entities/setupTfaResponse.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { Action, DetailSubjects } from '../../models/ability/ability.factory';
import { UpdateUserInput } from './dto/update-user.input';
import { CreateUserInput } from './dto/create-user.input';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from 'src/utils/constants';
import { Users } from './entities/users.entity';
import { Roles } from '@prisma/client';
import { CurrentUserToken } from 'src/common/decorators/currentUserToken.decorator';
import { SearchInput } from './dto/search.input';
import { SearchResults } from './entities/searchResults.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  // Create CSA
  @Mutation(() => CreateResponse)
  @CheckAbilities({
    action: Action.Create,
    subject: User,
    detailSubject: DetailSubjects.CSA,
  })
  createCsa(@Args('createAdminInput') createAdminInput: CreateAdminInput) {
    return this.usersService.createCsa(createAdminInput);
  }

  // Create CCSA
  @Mutation(() => CreateResponse)
  @CheckAbilities({
    action: Action.Create,
    subject: User,
    detailSubject: DetailSubjects.CCSA,
  })
  createCcsa(@Args('createCcsaInput') createCcsaInput: CreateAdminInput) {
    return this.usersService.createCcsa(createCcsaInput);
  }

  // Create Principal District Admin
  @Mutation(() => CreateResponse)
  @CheckAbilities({
    action: Action.Create,
    subject: User,
    detailSubject: DetailSubjects.PDA,
  })
  createPda(@Args('createPdaInput') createPdaInput: CreateDistrictInput) {
    return this.usersService.createPda(createPdaInput);
  }

  @Mutation(() => CreateResponse)
  @CheckAbilities({
    action: Action.Create,
    subject: User,
    detailSubject: DetailSubjects.DA,
  })
  createDa(@Args('createDaInput') createDaInput: CreateDistrictInput) {
    return this.usersService.createDa(createDaInput);
  }

  @Mutation(() => CreateResponse)
  @CheckAbilities({
    action: Action.Create,
    subject: User,
    detailSubject: DetailSubjects.PSA,
  })
  createPsa(@Args('createPsaInput') createPsa: CreateUserInput) {
    return this.usersService.createPsa(createPsa);
  }

  @Mutation(() => CreateResponse)
  @CheckAbilities({
    action: Action.Create,
    subject: User,
    detailSubject: DetailSubjects.SA,
  })
  createSa(@Args('createSaInput') createSa: CreateUserInput) {
    return this.usersService.createSa(createSa);
  }

  @Mutation(() => CreateResponse)
  @CheckAbilities({
    action: Action.Create,
    subject: User,
    detailSubject: DetailSubjects.TEACHER,
  })
  createTeacher(
    @Args('createTeacherInput') createTeacherInput: CreateUserInput,
  ) {
    return this.usersService.createTeacher(createTeacherInput);
  }

  @Mutation(() => CreateResponse)
  @CheckAbilities({
    action: Action.Create,
    subject: User,
    detailSubject: DetailSubjects.STUDENT,
  })
  createStudent(
    @Args('createStudentInput') createStudentInput: CreateUserInput,
  ) {
    return this.usersService.createStudent(createStudentInput);
  }

  @Mutation(() => CreateResponse)
  @CheckAbilities({
    action: Action.Create,
    subject: User,
    detailSubject: DetailSubjects.PARENT,
  })
  createParent(@Args('createParentInput') createParentInput: CreateUserInput) {
    return this.usersService.createParent(createParentInput);
  }

  // Setup Two Factor Authentication
  @Query(() => SetupTfaResponse)
  setupTfa(@CurrentUser() currentUser: User) {
    return this.usersService.setupTfa(currentUser);
  }

  //get students count in school
  @Query(() => Number)
  countStudentsInSchool(
    @CurrentUser() user: User,
    @Args('schoolId') schoolId: string,
  ) {
    return this.usersService.countStudentsInSchool(user, schoolId);
  }

  // query uses based on role
  @Query(() => Users)
  getUsersByRole(
    @CurrentUser() user: User,
    @Args('role') role: Roles,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.usersService.getUsersByRole(user, skip, limit, role);
  }

  // query uses based on role
  @Query(() => Users)
  getStudentsByTeacher(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.usersService.getStudentsByTeacher(user, skip, limit);
  }

  // get DA list by districtId
  @Query(() => Users)
  getUserListByDistrictIdAndRole(
    @CurrentUser() user: User,
    @Args('districtId') districtId: string,
    @Args('role') role: Roles,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.usersService.getUserListByDistrictIdAndRole(
      user,
      skip,
      limit,
      districtId,
      role,
    );
  }

  // get DA list by districtId
  @Query(() => Users)
  getUserListForSAByRole(
    @CurrentUser() user: User,
    @Args('role') role: Roles,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.usersService.getUserListForSAByRole(
      user,
      skip,
      limit,
      role,
    );
  }

  // Search anything
  @Query(() => SearchResults)
  search(
    @Args('searchInput') searchInput: SearchInput,
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.usersService.search(searchInput, user, skip, limit);
  }

  // get the user count by role
  @Query(() => Number)
  getUsersCountByRole(@CurrentUser() user: User, @Args('role') role: Roles) {
    return this.usersService.countUsersByRole(user, role);
  }

  // Enable Two Factor Authentication
  @Query(() => CreateResponse)
  enableTfa(
    @CurrentUser() currentUser: User,
    @Args('enableTfaInput') enableTfaInput: EnableTfaInput,
  ) {
    return this.usersService.enableTfa(currentUser, enableTfaInput);
  }

  @Query(() => User)
  @CheckAbilities({ action: Action.Read, subject: User })
  getUserById(@Args('id') id: string) {
    return this.usersService.findUserById(id);
  }

  // Verify Two Factor Authentication Token
  @Query(() => CreateResponse)
  verifyTfaToken(
    @CurrentUser() currentUser: User,
    @Args('verifyTfaInput') verifyTfaInput: EnableTfaInput,
  ) {
    return this.usersService.verifyTfaToken(currentUser, verifyTfaInput);
  }

  //get students count in school
  @Query(() => Number)
  countTeachersInSchool(
    @CurrentUser() user: User,
    @Args('schoolId') schoolId: string,
  ) {
    return this.usersService.countTeachersInSchool(user, schoolId);
  }
  //get teachers by school id
  @Query(() => Users)
  getTeachersBySchoolId(
    @CurrentUser() user: User,
    @Args('schoolId') schoolId: string,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.usersService.findTeachersBySchoolId(
      user,
      schoolId,
      skip,
      limit,
    );
  }

  @Mutation(() => User)
  @CheckAbilities({ action: Action.Delete, subject: User })
  removeUser(@Args('id') id: string, @CurrentUserToken() token: string) {
    return this.usersService.remove(id, token);
  }

  // create district example in postman (with file upload)
  // key => {"query":"mutation ($banner:Upload!,$profile:Upload!){\n updateAnyUser(updateUser:{bannerPicture:$banner,profilePicture:$profile,id:\"cl56thk2y0078b8d0d0ic6ml0\",profileAvailability:\"PUBLIC\"}){\nid\nbannerPicture\nprofilePicture\n}\n}", "variables": { "banner": null,"profile":null}}
  // map => { "0": ["variables.banner"],"1": ["variables.profile"]}
  // 0 => pick banner
  // 1 => pick profile
  // Update any user
  @Mutation(() => User)
  @CheckAbilities({ action: Action.Update, subject: User })
  updateAnyUser(
    @CurrentUser() user: User,
    @Args('updateUser') updateUser: UpdateUserInput,
    @CurrentUserToken() token: string,
  ) {
    return this.usersService.updateUser(user, updateUser, token);
  }

  //get teachers by school id
  @Query(() => Users)
  getStudentsBySchoolId(
    @CurrentUser() user: User,
    @Args('schoolId') schoolId: string,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.usersService.findStudentsBySchoolId(
      user,
      schoolId,
      skip,
      limit,
    );
  }

  // Update role for any user
  @Mutation(() => User)
  @CheckAbilities({ action: Action.Manage, subject: User })
  updateUserRole(@Args('id') userId: string, @Args('newRole') role: Roles) {
    return this.usersService.updateUserRole(userId, role);
  }

  //get users by Site Admin
  @Query(() => Users)
  getAllUsersByCSA(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.usersService.getAllUsersByCSA(user, skip, limit);
  }

  //get all public users
  @Query(() => Users)
  getAllPublicUsers(
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.usersService.getAllPublicUsers(skip, limit);
  }

  // get public user by id
  @Query(() => User)
  getPublicUserById(@Args('id') id: string) {
    return this.usersService.findPublicUserById(id);
  }
}
