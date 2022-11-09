/* eslint-disable max-len */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/services/prisma.service';
import { CreateCalendarEventInput } from './dto/create-calendarevent.input';
import { UpdateCalendarEventInput } from './dto/update-calendarevent.input';
import { User } from '../users/entities/user.entity';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';

@Injectable()
export class CalendarEventService {
  constructor(private readonly prismaService: PrismaService) {}

  createCalendarEvent(
    createCalendarEventInput: CreateCalendarEventInput,
    user: User,
  ) {
    return this.prismaService.calendarEvent.create({
      data: {
        ...createCalendarEventInput,
        userId: user.id,
      },
    });
  }

  async findMany(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const where = {
      userId: user.id,
    };
    const total = await this.prismaService.calendarEvent.count({ where });
    const data = await this.prismaService.calendarEvent.findMany({
      where,
      skip,
      take: limit,
    });

    return {
      data,
      pageInfo: {
        total,
        skip,
        limit,
      },
    };
  }

  async findOne(user: User, id: string) {
    const calendarEventExist =
      await this.prismaService.calendarEvent.findUnique({
        where: {
          id,
        },
      });

    if (!calendarEventExist) {
      throw new NotFoundException(`Calendar Event with id ${id} not found`);
    }

    const isOwnedByUser = calendarEventExist.userId === user.id;
    if (!isOwnedByUser) {
      throw new ForbiddenException('You are not authorized');
    }

    return calendarEventExist;
  }

  async updateCalendarEvent(
    updateCalendarEventInput: UpdateCalendarEventInput,
    user: User,
  ) {
    const calendarEventExist =
      await this.prismaService.calendarEvent.findUnique({
        where: {
          id: updateCalendarEventInput.id,
        },
      });

    if (!calendarEventExist) {
      throw new NotFoundException(
        `Calendar Event with id ${updateCalendarEventInput.id} not found`,
      );
    }

    const isOwnedByUser = calendarEventExist.userId === user.id;
    if (!isOwnedByUser) {
      throw new ForbiddenException('You are not authorized');
    }

    return this.prismaService.calendarEvent.update({
      where: {
        id: updateCalendarEventInput.id,
      },
      data: {
        ...updateCalendarEventInput,
      },
    });
  }

  async removeCalendarEvent(id: string, user: User) {
    const calendarEventExist =
      await this.prismaService.calendarEvent.findUnique({
        where: {
          id,
        },
      });

    if (!calendarEventExist) {
      throw new NotFoundException(`Calendar Event with id ${id} not found`);
    }

    const isOwnedByUser = calendarEventExist.userId === user.id;
    if (!isOwnedByUser) {
      throw new ForbiddenException('You are not authorized');
    }

    return this.prismaService.calendarEvent.delete({
      where: {
        id,
      },
    });
  }
}
