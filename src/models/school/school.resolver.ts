/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUserToken } from 'src/common/decorators/currentUserToken.decorator';
import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { Action, DetailSubjects } from '../ability/ability.factory';
import { District } from '../district/entities/district.entity';
import { CreateSchoolInput } from './dto/create-school.input';
import { UpdateSchoolInput } from './dto/update-school.input';
import { School } from './entities/school.entity';
import { Schools } from './entities/schools.entity';
import { SchoolsStatistics } from './entities/schoolsStatistics.entity';
import { SchoolService } from './school.service';

@Resolver(() => School)
export class SchoolResolver {
  constructor(private readonly schoolService: SchoolService) { }

  @Mutation(() => School)
  @CheckAbilities({ action: Action.Create, subject: School })
  async createSchool(
    @Args('createSchoolInput') createSchoolInput: CreateSchoolInput,
    @CurrentUserToken() token: string,
  ) {
    return this.schoolService.create(createSchoolInput, token);
  }

  @Query(() => Schools, { name: 'schools' })
  @CheckAbilities({
    action: Action.Read,
    subject: School,
    detailSubject: DetailSubjects.ALL,
  })
  findMany(
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.schoolService.findMany(skip, limit);
  }

  @Query(() => SchoolsStatistics)
  @CheckAbilities({
    action: Action.Read,
    subject: SchoolsStatistics,
  })
  findSchoolStatisticsInDistrict(
    @Args('id') id: string,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.schoolService.findSchoolStatisticsInDistrict(id, skip, limit);
  }

  @Query(() => Schools)
  @CheckAbilities({
    action: Action.Read,
    subject: School,
    detailSubject: DetailSubjects.DISTRICT,
  })
  findSchoolsInDistrict(
    @Args('id') id: string,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.schoolService.schoolsOfDistrict(id, skip, limit);
  }

  @Query(() => School, { name: 'school' })
  @CheckAbilities({ action: Action.Read, subject: School })
  findOne(@Args('id') id: string) {
    return this.schoolService.findOne(id);
  }

  @Mutation(() => School)
  @CheckAbilities({ action: Action.Update, subject: School })
  updateSchool(
    @Args('updateSchoolInput') updateSchoolInput: UpdateSchoolInput,
    @CurrentUserToken() token: string,
  ) {
    return this.schoolService.update(updateSchoolInput, token);
  }

  @Mutation(() => School)
  @CheckAbilities({ action: Action.Delete, subject: School })
  removeSchool(@Args('id') id: string, @CurrentUserToken() token: string) {
    return this.schoolService.remove(id, token);
  }
}
