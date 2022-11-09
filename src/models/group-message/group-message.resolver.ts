import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { User } from '../users/entities/user.entity';
import { CreateGroupMessageInput } from './dto/create-group-message.input';
import { CreateMessageGroupInput } from './dto/create-message-group';
import { UpdateMessageGroupInput } from './dto/upda-message-group';
import { UpdateGroupMessageInput } from './dto/update-group-message.input';
import {
  GroupMessage,
  UserMessageGroup,
} from './entities/group-message.entity';
import { GroupMessageService } from './group-message.service';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import {
  CurrentUserToken
} from '../../common/decorators/currentUserToken.decorator';

const pubSub = new PubSub();

@Resolver(() => GroupMessage)
export class GroupMessageResolver {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly groupMessageService: GroupMessageService) {}

  @Mutation(() => GroupMessage, { description: 'Create a new group message' })
  async sendMessageInGroup(
    @CurrentUser() user: User,
    @Args('createGroupMessageInput')
    createGroupMessageInput: CreateGroupMessageInput,
  ) {
    const newMessage = await this.groupMessageService.create(
      user.id,
      createGroupMessageInput,
    );

    pubSub.publish('groupMessageAdded', {
      groupId: newMessage.messageGroupId,
    });

    return newMessage;
  }

  @Mutation(() => GroupMessage, {
    description: 'Create a new group message with a file'
  })
  async sendMessageInGroupWithFile(
    @CurrentUser() user: User,
    @Args('createGroupMessageInput')
    createGroupMessageInput: CreateGroupMessageInput,
    @CurrentUserToken() token: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file,
  ) {
    const newMessage = await this.groupMessageService.create(
      user.id,
      createGroupMessageInput,
      token,
      file
    );

    pubSub.publish('groupMessageAdded', {
      groupId: newMessage.messageGroupId,
    });

    return newMessage;
  }

  @Mutation(() => GroupMessage, { description: 'delete message from group' })
  async deleteMessageInGroup(
    @Args('id') id: string,
    @CurrentUser() user: User,
    @CurrentUserToken() token: string
  ) {
    const message = await this.groupMessageService.deleteMessageFromGroup(
      id,
      user.id,
      token
    );

    pubSub.publish('groupMessageRemoved', {
      groupId: message.messageGroupId,
    });

    return message;
  }

  @Mutation(() => GroupMessage, { description: 'update group' })
  async updateMessageInGroup(
    @CurrentUser() user: User,
    @Args('updateGroupMessageInput') updateGroupInput: UpdateGroupMessageInput,
  ) {
    const message = await this.groupMessageService.updateMessageInGroup(
      user.id,
      updateGroupInput,
    );

    pubSub.publish('groupMessageUpdated', {
      groupId: message.messageGroupId,
    });

    return message;
  }

  @Mutation(() => GroupMessage, {
    description: 'update group message with file'
  })
  async updateMessageInGroupWithFile(
    @CurrentUser() user: User,
    @Args('updateGroupMessageInput') updateGroupInput: UpdateGroupMessageInput,
    @CurrentUserToken() token: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file,
  ) {
    const message = await this.groupMessageService.updateMessageInGroup(
      user.id,
      updateGroupInput,
      token,
      file
    );

    pubSub.publish('groupMessageUpdated', {
      groupId: message.messageGroupId,
    });

    return message;
  }

  @Mutation(() => GroupMessage)
  removeGroupMessage(@Args('id') id: string) {
    return this.groupMessageService.removeMessage(id);
  }

  @Query(() => [GroupMessage], {
    description: 'Get all groups a user has joined',
  })
  findAllGroups(@CurrentUser() user) {
    return this.groupMessageService.findAll(user);
  }

  @Query(() => GroupMessage)
  findOneGroup(@Args('id') id: string) {
    return this.groupMessageService.findOneGroup(id);
  }

  @Mutation(() => GroupMessage)
  updateGroupMessage(
    @Args('updateGroupMessageInput')
    updateGroupMessageInput: UpdateGroupMessageInput,
  ) {
    return this.groupMessageService.updateMessage(
      updateGroupMessageInput.id,
      updateGroupMessageInput,
    );
  }

  @Mutation(() => UserMessageGroup)
  createMessageGroup(
    @CurrentUser() user: User,
    @Args('createGroupMessageInput')
    createMessageGroupInput: CreateMessageGroupInput,
  ) {
    return this.groupMessageService.createMessageGroup(
      user.id,
      createMessageGroupInput,
    );
  }

  @Mutation(() => UserMessageGroup)
  createMessageGroupWithFile(
    @CurrentUser() user: User,
    @Args('createGroupMessageInput')
    createMessageGroupInput: CreateMessageGroupInput,
    @CurrentUserToken() token: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file,
  ) {
    return this.groupMessageService.createMessageGroup(
      user.id,
      createMessageGroupInput,
      token,
      file
    );
  }

  @Mutation(() => UserMessageGroup)
  addUserToGroup(
    @Args('groupId') groupId: string,
    @Args('userId') userId: string,
  ) {
    return this.groupMessageService.addUserToGroup(groupId, userId);
  }

  @Mutation(() => UserMessageGroup)
  removeUserFromGroup(
    @Args('groupId') groupId: string,
    @Args('userId') userId: string,
  ) {
    return this.groupMessageService.removeUserFromGroup(groupId, userId);
  }

  @Mutation(() => UserMessageGroup)
  deleteGroup(
    @Args('groupId') groupId: string,
    @CurrentUserToken() token: string
  ) {
    return this.groupMessageService.deleteGroup(groupId,token);
  }

  @Mutation(() => UserMessageGroup)
  updateGroup(
    @CurrentUser() user: User,
    @Args('updateGroupInput') updateGroupInput: UpdateMessageGroupInput,
  ) {
    return this.groupMessageService.updateGroup(user, updateGroupInput);
  }

  @Mutation(() => UserMessageGroup)
  updateGroupWithFile(
    @CurrentUser() user: User,
    @Args('updateGroupInput') updateGroupInput: UpdateMessageGroupInput,
    @CurrentUserToken() token: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file,
  ) {
    return this.groupMessageService.updateGroup(
      user,
      updateGroupInput,
      token,
      file
    );
  }

  @Subscription(() => GroupMessage, {
    name: 'groupMessageAdded',
    filter: (payload, variables) => {
      return payload.groupId === variables.groupId;
    },
  })
  groupMessageAdded() {
    return pubSub.asyncIterator('groupMessageAdded');
  }

  @Subscription(() => GroupMessage, {
    name: 'groupMessageRemoved',
    filter: (payload, variables) => {
      return payload.groupId === variables.groupId;
    },
  })
  groupMessageRemoved() {
    return pubSub.asyncIterator('groupMessageRemoved');
  }

  @Subscription(() => GroupMessage, {
    name: 'groupMessageUpdated',
    filter: (payload, variables) => {
      return payload.groupId === variables.groupId;
    },
  })
  groupMessageUpdated() {
    return pubSub.asyncIterator('groupMessageUpdated');
  }
}
