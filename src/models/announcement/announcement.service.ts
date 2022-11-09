/* eslint-disable max-statements */
/* eslint-disable no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../database/services/prisma.service';
import { CreateAnnouncementInput } from './dto/create-announcement.input';
import { UpdateAnnouncementInput } from './dto/update-announcement.input';
import { User } from '../users/entities/user.entity';
import { Roles, AnnouncementType } from '@prisma/client';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';

@Injectable()
export class AnnouncementService {
  constructor(private readonly prismaService: PrismaService) { }

  create(user: User, createAnnouncementInput: CreateAnnouncementInput) {
    const userId = user.id;
    switch (user.role) {
      case Roles.CCSA:
      case Roles.CSA:
        return this.prismaService.announcement.create({
          data: {
            ...createAnnouncementInput,
            type: AnnouncementType.SITE,
            userId,
          },
        });
      case Roles.PDA:
      case Roles.DA:
        return this.prismaService.announcement.create({
          data: {
            ...createAnnouncementInput,
            type: AnnouncementType.DISTRICT,
            districtId: user.districtId,
            userId,
          },
        });
      case Roles.PSA:
      case Roles.SA:
        return this.prismaService.announcement.create({
          data: {
            ...createAnnouncementInput,
            type: AnnouncementType.SCHOOL,
            schoolId: user.schoolId,
            districtId: user.districtId,
            userId,
          },
        });
      case Roles.TEACHER:
        return this.prismaService.announcement.create({
          data: {
            ...createAnnouncementInput,
            type: AnnouncementType.COURSE,
            schoolId: user.schoolId,
            districtId: user.districtId,
            userId
          },
        });
      default:
        throw new ForbiddenException(
          'You are not authorized to create the announcement',
        );
    }
  }

  async findMany(user: User, skip: number, limit: number) {
    // It returns all Announcements which
    // is visible to current user
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    switch (user.role) {
      case Roles.CCSA:
      case Roles.CSA: {
        const where = {
          type: AnnouncementType.SITE,
        };
        const total = await this.prismaService.announcement.count({ where });
        const data = await this.prismaService.announcement.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: true,
          }
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
      case Roles.PDA:
      case Roles.DA: {
        const where = {
          OR: [
            { type: AnnouncementType.SITE },
            {
              type: AnnouncementType.DISTRICT,
              districtId: user.districtId,
            },
          ],
        };
        const total = await this.prismaService.announcement.count({ where });
        const data = await this.prismaService.announcement.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: true,
          }
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
      case Roles.PSA:
      case Roles.SA: {
        const where = {
          OR: [
            { type: AnnouncementType.SITE },
            {
              type: AnnouncementType.DISTRICT,
              districtId: user.districtId,
            },
            {
              type: AnnouncementType.SCHOOL,
              schoolId: user.schoolId,
            },
          ],
        };
        const total = await this.prismaService.announcement.count({ where });
        const data = await this.prismaService.announcement.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: true,
          }
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
      default: {
        const courseIds = user.studentCourses.map((course) => course.courseId);
        const where = {
          OR: [
            { type: AnnouncementType.SITE },
            {
              type: AnnouncementType.DISTRICT,
              districtId: user.districtId,
            },
            {
              type: AnnouncementType.SCHOOL,
              schoolId: user.schoolId,
            },
            {
              type: AnnouncementType.COURSE,
              courseId: { in: courseIds },
            },
          ],
        };
        const total = await this.prismaService.announcement.count({ where });
        const data = await this.prismaService.announcement.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: true,
          }
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
    }
  }

  async findOne(user: User, id: string) {
    const announcementExists = await this.prismaService.announcement.findUnique(
      {
        where: { id },
        include: {
          user: true,
        }
      },
    );

    if (!announcementExists) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    const courseIds = user.studentCourses.map((course) => course.courseId);
    if (
      announcementExists.districtId !== user.districtId &&
      announcementExists.type === AnnouncementType.DISTRICT
    ) {
      throw new ForbiddenException();
    } else if (
      announcementExists.schoolId !== user.schoolId &&
      announcementExists.type === AnnouncementType.SCHOOL
    ) {
      throw new ForbiddenException();
    } else if (
      !courseIds.includes(announcementExists.courseId) &&
      announcementExists.type === AnnouncementType.COURSE
    ) {
      throw new ForbiddenException();
    }

    return announcementExists;
  }

  async update(id: string, updateAnnouncementInput: UpdateAnnouncementInput) {
    const announcementExists = await this.prismaService.announcement.findUnique(
      {
        where: {
          id,
        },
      },
    );

    if (!announcementExists) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return this.prismaService.announcement.update({
      where: {
        id,
      },
      data: {
        ...updateAnnouncementInput,
        id,
      },
    });
  }

  async remove(id: string) {
    const announcementExists = await this.prismaService.announcement.findUnique(
      {
        where: {
          id,
        },
      },
    );

    if (!announcementExists) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return this.prismaService.announcement.delete({
      where: {
        id,
      },
    });
  }
}
