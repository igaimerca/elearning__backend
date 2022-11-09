/* eslint-disable no-unused-vars */
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Public } from 'src/common/decorators/skipAuth.decorator';
import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { Action } from '../ability/ability.factory';
import { User } from '../users/entities/user.entity';
import { CreateMessageInput } from './dto/create-message.input';
import { UpdateMessageInput } from './dto/update-message.input';
import { Message } from './entities/message.entity';
import { MessageService } from './message.service';
import {
  CurrentUserToken
} from '../../common/decorators/currentUserToken.decorator';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

// const pubSub = new PubSub();

@Resolver(() => Message)
export class MessageResolver {
  private pubSub: PubSub;
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly messageService: MessageService) {
    this.pubSub = new PubSub();
  }

  @Mutation(() => Message)
  async sendMessage(
    @CurrentUser() user: User,
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
  ) {
    const message = await this.messageService.create(user, createMessageInput);

    this.pubSub.publish('messageAdded', {
      messageAdded: message,
      variables: {
        user,
      },
    });

    return message;
  }

  @Mutation(() => Message)
  async sendMessageWithFile(
    @CurrentUser() user: User,
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @CurrentUserToken() token: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file,
  ) {
    const message = await this.messageService.create(
      user,
      createMessageInput,
      token,
      file
    );

    this.pubSub.publish('messageAdded', {
      messageAdded: message,
      variables: {
        user,
      },
    });

    return message;
  }

  @Query(() => Message, { name: 'message' })
  @CheckAbilities({ action: Action.Read, subject: Message })
  findOne(@Args('id') id: string) {
    return this.messageService.findOne(id);
  }

  @Query(() => [Message], { description: 'Query returns dms about two people' })
  getMessagesBetween(
    @CurrentUser() user: User,
    @Args('userId') userId: string,
  ) {
    return this.messageService.getMessagesBetween(user, userId);
  }

  @Mutation(() => Message)
  @CheckAbilities({ action: Action.Update, subject: Message })
  async updateMessage(
    @CurrentUser() user: User,
    @Args('updateMessageInput') updateMessageInput: UpdateMessageInput,
  ) {
    const message = await this.messageService.update(
      updateMessageInput.id,
      updateMessageInput,
    );

    this.pubSub.publish('messageUpdated', {
      messageUpdated: message,
      variables: {
        user,
      },
    });

    return message;
  }

  @Mutation(() => Message)
  @CheckAbilities({ action: Action.Update, subject: Message })
  async updateMessageWithFile(
    @CurrentUser() user: User,
    @Args('updateMessageInput') updateMessageInput: UpdateMessageInput,
    @CurrentUserToken() token: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file,
  ) {
    const message = await this.messageService.update(
      updateMessageInput.id,
      updateMessageInput,
      user,
      token,
      file
    );

    this.pubSub.publish('messageUpdated', {
      messageUpdated: message,
      variables: {
        user,
      },
    });

    return message;
  }

  @Mutation(() => Message)
  @CheckAbilities({ action: Action.Delete, subject: Message })
  async removeMessage(
    @CurrentUser() user,
    @Args('id') id: string,
    @CurrentUserToken() token: string
  ) {
    const removedMessage = await this.messageService.remove(id, token);

    this.pubSub.publish('messageRemoved', {
      messageRemoved: removedMessage,
      variables: {
        user,
      },
    });

    return removedMessage;
  }


  @Public() // TODO(@veritem): fix authentication in graphql subscriptions
  @Subscription(() => Message, {
    name: 'messageAdded',
    filter: (payload) => {
      const user = payload.variables.user;
      const { messageAdded } = payload;
      return (
        messageAdded.toId === user.id
        || messageAdded.fromId === user.id
      ) ? messageAdded : null;
    },
  })
  messageAdded() {
    return this.pubSub.asyncIterator('messageAdded');
  }

  @Subscription(() => Message, {
    name: 'messageRemoved',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter: (payload, _variables) => {
      const user = payload.variables.user;
      const { messageRemoved } = payload;
      return (
        messageRemoved.toId === user.id
        || messageRemoved.fromId === user.id
      ) ? messageRemoved : null;
    },
  })
  messageRemoved() {
    return this.pubSub.asyncIterator('messageRemoved');
  }

  @Subscription(() => Message, {
    name: 'messageUpdated',
    filter: (payload, variables) => {
      const { user } = variables;
      const { messageUpdated } = payload;
      return (
        messageUpdated.toId === user.id || messageUpdated.fromId === user.id
      );
    },
  })
  messageUpdated() {
    return this.pubSub.asyncIterator('messageUpdated');
  }
}
