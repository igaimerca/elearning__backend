/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { Resolver, Query, Mutation, Args, Int, Subscription } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateResponse } from '../users/entities/createResponse.entity';
import { PubSub } from 'graphql-subscriptions';
import { Public } from 'src/common/decorators/skipAuth.decorator';
import { CreateDailyEmailNotificationInput } from './dto/create-daily-notification.input';

@Resolver(() => Notification)
export class NotificationResolver {
  private pubSub: PubSub;
  constructor(private readonly notificationService: NotificationService) {
    this.pubSub = new PubSub();
  }
  @Mutation(() => [Notification])
  async missingAssignmentNotification(@CurrentUser() user, @Args('courseId', { type: () => String }) courseId: string) {
    const data = await this.notificationService.missingAssignmentNotification(user, courseId);
    this.pubSub.publish('missingAssignmentNotificationAdded', {
      missingAssignmentNotificationAdded: data,
      variables: {
        user,
      },
    });
    return data;
  }
  @Public()
  @Subscription(() => [Notification], {
    name: 'missingAssignmentNotificationAdded',
    description: 'Notification when a user is missing an assignment',
    filter: (payload, _variables) => {
      const user = payload.variables.user;
      const { missingAssignmentNotificationAdded } = payload;
      return missingAssignmentNotificationAdded[0].userId === user.id;
    }
  })
  missingAssignmentNotificationAdded() {
    return this.pubSub.asyncIterator('missingAssignmentNotificationAdded');
  }

  @Mutation(() => Notification)
  createNotification(@CurrentUser() user, @Args('createNotificationInput') createNotificationInput: CreateNotificationInput) {
    const data = this.notificationService.create(user, createNotificationInput);
    this.pubSub.publish('notificationAdded', {
      notificationAdded: data,
      variables: {
        user,
      },
    });
    return data;
  }
  //TODO:fixing auth prob
  @Public()
  @Subscription(() => Notification)
  notificationAdded() {
    return this.pubSub.asyncIterator('notificationAdded');
  }

  @Mutation(() => Notification)
  assignmentCountNotification(@CurrentUser() user, @Args('courseId', { type: () => String }) courseId: string) {
    const data = this.notificationService.assignmentCount(user, courseId);
    this.pubSub.publish('assignmentCountNotificationAdded', {
      assignmentCountNotificationAdded: data,
      variables: {
        user,
      },
    });
    return data;
  }

  @Public()
  @Subscription(() => Notification, {
    name: 'assignmentCountNotificationAdded',
    description: 'Total assingment for a certain teacher',
    filter: (payload, _variables) => {
      const { assignmentCountNotificationAdded } = payload;
      return assignmentCountNotificationAdded;
    }
  })
  assignmentCountNotificationAdded() {
    return this.pubSub.asyncIterator('assignmentCountNotificationAdded');
  }

  @Public()
  @Mutation(() => CreateResponse)
  sendDailyEmail(@Args('createDailyEmailNotificationInput') createDailyEmailNotificationInput: CreateDailyEmailNotificationInput) {
    return this.notificationService.dailyEmail(createDailyEmailNotificationInput);
  }
  @Query(() => [Notification])
  findAllUserNotification() {
    return this.notificationService.findAllUserNotification();
  }

  @Query(() => Notification)
  findNotificationById(@Args('id', { type: () => String }) id: string) {
    return this.notificationService.findNotificationById(id);
  }
  @Query(() => [Notification])
  findUserNotification(@Args('userId', { type: () => String }) id: string) {
    return this.notificationService.findUserNotification(id);
  }

  @Mutation(() => Notification)
  updateNotification(@Args('updateNotificationInput') updateNotificationInput: UpdateNotificationInput) {
    return this.notificationService.update(updateNotificationInput.id, updateNotificationInput);
  }
  @Mutation(() => Notification)
  assignmentDue(@CurrentUser() user, @Args('createNotificationInput') createNotificationInput: CreateNotificationInput) {
    const data = this.notificationService.assignmentDueNotification(user, createNotificationInput);
    this.pubSub.publish('assignmentDueNotification', {
      assignmentDueNotification: data,
      variables: {
        user,
      },
    });
    return data;
  }

  @Public()
  @Subscription(() => Notification, {
    name: 'assignmentDueNotification',
    filter: (payload, _variables) => {
      const { assignmentDueNotification } = payload;
      return assignmentDueNotification;
    }
  })
  assignmentDueNotification() {
    return this.pubSub.asyncIterator('assignmentDueNotification');
  }

}
