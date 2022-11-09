/* eslint-disable no-unused-vars */
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { AnnouncementType, Roles } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';

import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { Action } from '../ability/ability.factory';
import { User } from '../users/entities/user.entity';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementInput } from './dto/create-announcement.input';
import { Announcement } from './entities/announcement.entity';
import { Announcements } from './entities/announcements.entity';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';

const pubSub = new PubSub();

@Resolver(() => Announcement)
export class AnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Mutation(() => Announcement)
  @CheckAbilities({ action: Action.Create, subject: Announcement })
  createAnnouncement(
    @CurrentUser() user: User,
    @Args('createAnnouncementInput')
    createAnnouncementInput: CreateAnnouncementInput,
  ) {
    const newAnnouncement = this.announcementService.create(
      user,
      createAnnouncementInput,
    );

    if (user.role === Roles.CSA || user.role === Roles.CCSA) {
      setTimeout(async () => {
        try {
          const announcement  = await this.announcementService.findOne(
            user,
            (await newAnnouncement).id
          );
          pubSub.publish('announcementCreated', {
            announcementCreated: announcement,
          });
        } catch (e) {
          delete e.message;
        }
      }, 5*60* 1000);
    } else {
      pubSub.publish('announcementCreated', {
        announcementCreated: newAnnouncement,
      });
    }



    return newAnnouncement;
  }

  @Query(() => Announcements, { name: 'getAnnouncements' })
  findMany(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.announcementService.findMany(user, skip, limit);
  }

  @Query(() => Announcement, { name: 'getAnnouncement' })
  findOne(@CurrentUser() user: User, @Args('id') id: string) {
    return this.announcementService.findOne(user, id);
  }

  @Subscription(() => Announcement, {
    filter: (payload, variables) => {
      // We can't get the user variable from GqlAuthGuard here
      // So user variable should be provided in graphql
      const { user } = variables;
      const { announcementCreated } = payload;

      switch (announcementCreated.type) {
        case AnnouncementType.SITE:
          return true;
        case AnnouncementType.DISTRICT:
          if (announcementCreated.districtId === user.districtId) {
            return true;
          }

          return false;
        case AnnouncementType.SCHOOL:
          if (announcementCreated.schoolId === user.schoolId) {
            return true;
          }

          return false;
        default:
          return false;
      }
    },
  })
  announcementCreated() {
    return pubSub.asyncIterator('announcementCreated');
  }
}
