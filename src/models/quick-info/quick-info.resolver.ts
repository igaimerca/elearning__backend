import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateQuickInfoInput } from './dto/create-quick-info.input';
import { UpdateQuickInfoInput } from './dto/update-quick-info.input';
import { QuickInfo } from './entities/quick-info.entity';
import { QuickInfos } from './entities/quick-infos.entity';
import { QuickInfoService } from './quick-info.service';

@Resolver(() => QuickInfo)
export class QuickInfoResolver {
  constructor(private readonly quickInfoService: QuickInfoService) {}

  @Mutation(() => QuickInfo)
  createQuickInfo(
    @CurrentUser() user: User,
    @Args('createQuickInfoInput') createQuickInfoInput: CreateQuickInfoInput,
  ) {
    return this.quickInfoService.create(user.id, createQuickInfoInput);
  }

  @Query(() => QuickInfos, { name: 'quickInfos' })
  findMany(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.quickInfoService.findMany(user.id, skip, limit);
  }

  @Query(() => QuickInfo, { name: 'quickInfo' })
  findOne(
    @CurrentUser() user: User,
    @Args('id', { type: () => String }) id: string,
  ) {
    return this.quickInfoService.findOne(user.id, id);
  }

  @Mutation(() => QuickInfo)
  updateQuickInfo(
    @CurrentUser() user,
    @Args('updateQuickInfoInput') updateQuickInfoInput: UpdateQuickInfoInput,
  ) {
    return this.quickInfoService.update(
      user,
      updateQuickInfoInput.id,
      updateQuickInfoInput,
    );
  }

  @Mutation(() => QuickInfo)
  removeQuickInfo(
    @CurrentUser() user,
    @Args('id', { type: () => String }) id: string,
  ) {
    return this.quickInfoService.remove(user, id);
  }
}
