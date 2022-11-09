import { Roles } from '.prisma/client';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Day } from 'src/common/enums/fileType.enum copy';
import { PrismaService } from 'src/database/services/prisma.service';
import { User } from '../users/entities/user.entity';
import { CreateScheduleInput } from './dto/create-schedule.input';
import { UpdateScheduleInput } from './dto/update-schedule.input';

@Injectable()
export class ScheduleService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(user: User, createScheduleInput: CreateScheduleInput) {
    console.log({
      userId: user.id,
      title: createScheduleInput.title,
      subtitle: createScheduleInput.title,
      description: createScheduleInput.description,
      color: createScheduleInput.color,
      startingTime: createScheduleInput.startingTime,
      endingTime: createScheduleInput.endingTime,
      day: createScheduleInput.day.map((d) => Day[d]),
    });
    const schedule = await this.prismaService.schedule.create({
      data: {
        userId: user.id,
        title: createScheduleInput.title,
        subtitle: createScheduleInput.title,
        description: createScheduleInput.description,
        color: createScheduleInput.color,
        startingTime: createScheduleInput.startingTime,
        endingTime: createScheduleInput.endingTime,
        day: createScheduleInput.day.map((d) => Day[d]),
      },
      include: {
        user: true,
      },
    });

    return schedule;
  }

  async update(user: User, updateScheduleInput: UpdateScheduleInput) {
    const scheduleExist = await this.prismaService.schedule.findFirst({
      where: {
        id: updateScheduleInput.id,
        userId: user.id,
      },
    });
    if (!scheduleExist) {
      throw new NotFoundException('Schedule not found');
    }

    const days = updateScheduleInput.day
      ? [...scheduleExist.day, ...updateScheduleInput.day.map((d) => Day[d])]
      : undefined;

    const schedule = await this.prismaService.schedule.update({
      where: {
        id: updateScheduleInput.id,
      },
      data: {
        userId: user.id,
        title: updateScheduleInput.title,
        subtitle: updateScheduleInput.title,
        description: updateScheduleInput.description,
        color: updateScheduleInput.color,
        startingTime: updateScheduleInput.startingTime,
        endingTime: updateScheduleInput.endingTime,
        day: days,
      },
      include: {
        user: true,
      },
    });

    return schedule;
  }

  async findByDay(user: User, day?: Day) {
    const where = day
      ? {
          userId: user.id,
          day: {
            has: day,
          },
        }
      : {
          userId: user.id,
        };

    const data = await this.prismaService.schedule.findMany({
      where,
    });
    const result = new Array(7).fill({}).map((_, i) => {
      return {
        day: i + 1,
        events: data.filter((d) => d.day.includes(Object.values(Day)[i])),
      };
    });

    return result;
  }

  async findByStudent(user: User) {
    if (user.role !== Roles.STUDENT) {
      throw new ForbiddenException('You are not allowed');
    }
    const data = await this.prismaService.schedule.findMany({
      where: {
        userId: user.id,
      },
    });
    return data;
  }
  }
