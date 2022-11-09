/* eslint-disable no-unused-vars */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReadStatus } from '@prisma/client';

import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { Action } from '../ability/ability.factory';
import { User } from '../users/entities/user.entity';
import { CreateSuggestionInput } from './dto/create-suggestion.input';
import { Suggestion } from './entities/suggestion.entity';
import { Suggestions } from './entities/suggestions.entity';
import { SuggestionService } from './suggestion.service';

@Resolver(() => Suggestion)
export class SuggestionResolver {
  constructor(private readonly suggestionService: SuggestionService) {}

  @Mutation(() => Suggestion)
  @CheckAbilities({ action: Action.Create, subject: Suggestion })
  createSuggestion(
    @CurrentUser() user: User,
    @Args('createSuggestionInput') createSuggestionInput: CreateSuggestionInput,
  ) {
    return this.suggestionService.create(user, createSuggestionInput);
  }

  @Query(() => Suggestions, { name: 'suggestions' })
  @CheckAbilities({ action: Action.Read, subject: Suggestion })
  findMany(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.suggestionService.findMany(user, skip, limit);
  }

  @Query(() => Suggestion, { name: 'suggestion' })
  @CheckAbilities({ action: Action.Read, subject: Suggestion })
  findOne(@CurrentUser() user: User, @Args('id') id: string) {
    return this.suggestionService.findOne(user, id);
  }

  @Mutation(() => Boolean)
  @CheckAbilities({ action: Action.Update, subject: Suggestion })
  setAdminRead(@CurrentUser() user: User, @Args('id') id: string) {
    return this.suggestionService.setAdminReadStatus(user, id, ReadStatus.READ);
  }

  @Mutation(() => Boolean)
  @CheckAbilities({ action: Action.Update, subject: Suggestion })
  setAdminUnread(@CurrentUser() user: User, @Args('id') id: string) {
    return this.suggestionService.setAdminReadStatus(
      user, id, ReadStatus.UNREAD
    );
  }
}
