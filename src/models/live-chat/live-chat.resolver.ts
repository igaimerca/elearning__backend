/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateLiveChatInput } from './dto/create-live-chat.input';
import { UpdateLiveChatInput } from './dto/update-live-chat.input';
import { LiveChat } from './entities/live-chat.entity';
import { LiveChatService } from './live-chat.service';

@Resolver(() => LiveChat)
export class LiveChatResolver {
  constructor(private readonly liveChatService: LiveChatService) {}

  @Mutation(() => LiveChat)
  createLiveChat(
    @Args('createLiveChatInput') createLiveChatInput: CreateLiveChatInput,
  ) {
    return this.liveChatService.create(createLiveChatInput);
  }

  @Query(() => [LiveChat], { name: 'liveChat' })
  findAll() {
    return this.liveChatService.findAll();
  }

  @Query(() => LiveChat, { name: 'liveChat' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.liveChatService.findOne(id);
  }

  @Mutation(() => LiveChat)
  updateLiveChat(
    @Args('updateLiveChatInput') updateLiveChatInput: UpdateLiveChatInput,
  ) {
    return this.liveChatService.update(
      updateLiveChatInput.id,
      updateLiveChatInput,
    );
  }

  @Mutation(() => LiveChat)
  removeLiveChat(@Args('id', { type: () => Int }) id: number) {
    return this.liveChatService.remove(id);
  }
}
