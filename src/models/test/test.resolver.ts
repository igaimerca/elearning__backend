import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TestService } from './test.service';
import { Test } from './entities/test.entity';
import { CreateTestInput } from './dto/create-test.input';
import { UpdateTestInput } from './dto/update-test.input';
import { CheckAbilities } from 'src/common/decorators/abilities.decorator';
import { Action } from '../ability/ability.factory';
import { TestWithStudents } from './entities/test-with-students.entity';
import { AsyncAction } from 'rxjs/internal/scheduler/AsyncAction';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { User } from '@prisma/client';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from 'src/utils/constants';
import { Tests } from './entities/tests.entity';

@Resolver(() => Test)
export class TestResolver {
  constructor(private readonly testService: TestService) {}

  @Mutation(() => Test)
  @CheckAbilities({ action: Action.Create, subject: Test })
  createTest(@Args('createTestInput') createTestInput: CreateTestInput) {
    return this.testService.create(createTestInput);
  }

  @Query(() => [TestWithStudents], { name: 'testsByCourse' })
  @CheckAbilities({ action: Action.Create, subject: Test })
  findByCourse(
    @Args('courseId') courseId: string
  ) {
    return this.testService.findByCourse(courseId);
  }

  @Query(() => Tests, { name: 'testByTeacher' })
  @CheckAbilities({ action: Action.Create, subject: Test })
  findByTeacher(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.testService.findByTeacher(user,skip,limit);
  }
}
