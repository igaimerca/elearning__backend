import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateKnowledgeBaseInput } from './dto/create-knowledge-base.input';
import { UpdateKnowledgeBaseInput } from './dto/update-knowledge-base.input';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeBases } from './entities/knowledge-bases.entity';
import { KnowledgeBaseService } from './knowledge-base.service';

@Resolver(() => KnowledgeBase)
export class KnowledgeBaseResolver {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Mutation(() => KnowledgeBase)
  createKnowledgeBase(
    @CurrentUser() user: User,
    @Args('createKnowledgeBaseInput')
    createKnowledgeBaseInput: CreateKnowledgeBaseInput,
  ) {
    return this.knowledgeBaseService.create(user.id, createKnowledgeBaseInput);
  }

  @Query(() => KnowledgeBases, { name: 'knowledgeBases' })
  findAll(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.knowledgeBaseService.findAll(user, skip, limit);
  }

  @Query(() => KnowledgeBases, { name: 'publishedKnowledgeBases' })
  findPublishedKnowledgeBases(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.knowledgeBaseService.findPublished(user, skip, limit);
  }

  @Query(() => KnowledgeBase, { name: 'knowledgeBase' })
  findOne(@CurrentUser() user: User, @Args('id') id: string) {
    return this.knowledgeBaseService.findOne(user, id);
  }

  @Mutation(() => KnowledgeBase)
  updateKnowledgeBase(
    @CurrentUser() user: User,
    @Args('updateKnowledgeBaseInput')
    updateKnowledgeBaseInput: UpdateKnowledgeBaseInput,
  ) {
    return this.knowledgeBaseService.update(
      user,
      updateKnowledgeBaseInput.id,
      updateKnowledgeBaseInput,
    );
  }

  @Mutation(() => KnowledgeBase)
  removeKnowledgeBase(@CurrentUser() user: User, @Args('id') id: string) {
    return this.knowledgeBaseService.remove(user, id);
  }

  @Query(() => KnowledgeBases)
  searchKnowledgeBase(
    @CurrentUser() user: User,
    @Args('query') query: string,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.knowledgeBaseService.search(user, query, skip, limit);
  }
}
