import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { User } from '../users/entities/user.entity';
import { ParentChildService } from './parent-child.service';
import { CreateParentChildInput } from './dto/create-parent-child.input';
import { ParentChild } from './entities/parent-child.entity';

@Resolver(() => ParentChild)
export class ParentChildResolver {
  constructor(private readonly ParentChildService: ParentChildService) {}

  @Mutation(() => ParentChild)
  createParentChild(
    @CurrentUser() user: User,
    @Args('createParentChild') dto: CreateParentChildInput,
  ) {
    return this.ParentChildService.create(dto);
  }

  @Query(() => ParentChild, { name: 'ParentChildData' })
  findOne(@Args('id') id: string) {
    return this.ParentChildService.findOne(id);
  }

  @Query(() => [ParentChild])
  getParentChildren(@Args('id', { description: 'parent id' }) id: string) {
    return this.ParentChildService.findParentChildren(id);
  }

  @Mutation(() => ParentChild)
  removeAssignment(@CurrentUser() user: User, @Args('id') id: string) {
    return this.ParentChildService.remove(id);
  }
}
