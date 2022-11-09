/* eslint-disable max-statements */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Roles, ProfileAvailability, Prisma } from '@prisma/client';
import * as FormData from 'form-data';
import { FileUploadService } from '../../fileUpload/fileUpload.service';
import { FileType } from '../../common/enums/fileType.enum';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { TwoFactorAuthService } from '../../common/services/twoFactorAuth.service';
import { ResponseStatus } from '../../common/enums/responseStatus.enum';
import { SendGridService } from '../../common/services/sendgrid.service';
import { PrismaService } from '../../database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { generateRandomAlphaNumericPassword, hash } from '../../utils/password';
import { CreateAdminInput } from './dto/create-admin.input';
import { CreatePdaInput } from './dto/create-pda.input';
import { CreateUserInput } from './dto/create-user.input';
import { DashboardDTO } from './dto/dashboard-data.dto';
import { EnableTfaInput } from './dto/enable-tfa.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import {
  SearchCategories,
  SearchDateRange,
  SearchInput,
} from './dto/search.input';
import { SearchResult } from './entities/searchResult.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sendgridService: SendGridService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly fileUploadService: FileUploadService
  ) { }

  // Private methods
  public async checkIfUserExists(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return true;
    }

    return false;
  }

  async getUsersByRole(user: User, skip: number, limit: number, role: Roles) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    let where: any = { role };
    if (user.role === Roles.PDA || user.role === Roles.DA) {
      where = {
        role,
        districtId: user.districtId,
      };
    } else if (user.role === Roles.PSA || user.role === Roles.SA) {
      where = {
        role,
        schoolId: user.schoolId,
      };
    } else if (
      user.role === Roles.TEACHER ||
      user.role === Roles.STUDENT ||
      user.role === Roles.PARENT
    ) {
      throw new ForbiddenException('You are not allowed');
    }

    const total = await this.prismaService.user.count({
      where,
    });

    const data = await this.prismaService.user.findMany({
      skip,
      take: limit,
      where,
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

  async getStudentsByTeacher(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (user.role !== Roles.TEACHER) {
      throw new ForbiddenException('You are not allowed');
    }

    const where = {
      studentCourses: {
        some: {
          course: {
            teacherId: user.id
          }
        }
      }
    };

    const total = await this.prismaService.user.count({
      where,
    });

    const data = await this.prismaService.user.findMany({
      skip,
      take: limit,
      where,
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

  async getUserListByDistrictIdAndRole(
    user: User,
    skip: number,
    limit: number,
    districtId: string,
    role: Roles,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (
      user.role !== Roles.CCSA &&
      user.role !== Roles.CSA &&
      user.role !== Roles.PDA &&
      user.role !== Roles.DA
    ) {
      throw new ForbiddenException('You are not allowed');
    }

    if (
      (user.role === Roles.PDA || user.role === Roles.DA) &&
      user.districtId !== districtId
    ) {
      throw new ForbiddenException('You are not allowed');
    }

    const total = await this.prismaService.user.count({
      where: {
        role,
        districtId,
      },
    });

    const data = await this.prismaService.user.findMany({
      skip,
      take: limit,
      where: {
        role,
        districtId,
      },
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

  async getUserListForSAByRole(
    user: User,
    skip: number,
    limit: number,
    role: Roles,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (user.role !== Roles.SA) {
      throw new ForbiddenException('You are not allowed');
    }

    const total = await this.prismaService.user.count({
      where: {
        role,
        schoolId: user.schoolId,
      },
    });

    const data = await this.prismaService.user.findMany({
      skip,
      take: limit,
      where: {
        role,
        schoolId: user.schoolId,
      },
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

  async findCourseIdsByUser(user: User): Promise<string[]> {
    if (user.role === Roles.TEACHER) {
      return (
        await this.prismaService.course.findMany({
          where: {
            teacherId: user.id,
          },
          select: {
            id: true,
          },
        })
      ).map((el) => el.id);
    }
    if (user.role === Roles.STUDENT) {
      return (
        await this.prismaService.user.findUnique({
          where: {
            id: user.id,
          },
          include: {
            studentCourses: {
              select: {
                courseId: true,
              },
            },
          },
        })
      ).studentCourses.map((studentCourse) => studentCourse.courseId);
    }
    if (user.role === Roles.PARENT) {
      return (
        await this.prismaService.parentChild.findMany({
          where: {
            parentId: user.id,
          },
          include: {
            child: {
              include: {
                studentCourses: {
                  select: {
                    courseId: true,
                  },
                },
              },
            },
          },
        })
      )
        .map((parentChild) =>
          parentChild.child.studentCourses
            .map((studentCourse) => studentCourse.courseId)
            .join(),
        )
        .join()
        .split(',');
    }
    if (user.role === Roles.PDA || user.role === Roles.DA) {
      return (
        await this.prismaService.district.findFirst({
          where: {
            id: user.districtId,
          },
          include: {
            schools: {
              include: {
                courses: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        })
      ).schools
        .map((school) => school.courses.map((course) => course.id).join())
        .join()
        .split(',');
    }
    if (user.role === Roles.PSA || user.role === Roles.SA) {
      return (
        await this.prismaService.course.findMany({
          where: {
            schoolId: user.schoolId,
          },
          select: {
            id: true,
          },
        })
      ).map((course) => course.id);
    }

    return (
      await this.prismaService.course.findMany({
        where: {},
        select: {
          id: true,
        },
      })
    ).map((el) => el.id);
  }

  async findUserIdsByUser(user: User): Promise<string[]> {
    if (user.role === Roles.TEACHER) {
      return (
        await this.prismaService.course.findMany({
          where: {
            teacherId: user.id,
          },
          include: {
            students: {
              select: {
                id: true,
              },
            },
          },
        })
      )
        .map((el) => el.students.map((student) => student.id).join())
        .join()
        .split(',');
    }
    if (user.role === Roles.PARENT) {
      return (
        await this.prismaService.parentChild.findMany({
          where: {
            parentId: user.id,
          },
          select: {
            childId: true,
          },
        })
      ).map((el) => el.childId);
    }
    if (user.role === Roles.PDA || user.role === Roles.DA) {
      return (
        await this.prismaService.user.findMany({
          where: {
            districtId: user.districtId,
          },
          select: {
            id: true,
          },
        })
      ).map((el) => el.id);
    }
    if (
      user.role === Roles.PSA ||
      user.role === Roles.SA ||
      user.role === Roles.STUDENT
    ) {
      return (
        await this.prismaService.user.findMany({
          where: {
            schoolId: user.schoolId,
          },
          select: {
            id: true,
          },
        })
      ).map((el) => el.id);
    }

    return (
      await this.prismaService.user.findMany({
        where: {},
        select: {
          id: true,
        },
      })
    ).map((el) => el.id);
  }

  findDateLimits(range: SearchDateRange) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    switch (range) {
      case SearchDateRange.OneDay: {
        startDate.setDate(startDate.getDate() - 1);
        break;
      }
      case SearchDateRange.ThreeDays: {
        startDate.setDate(startDate.getDate() - 3);
        break;
      }
      case SearchDateRange.OneWeek: {
        startDate.setDate(startDate.getDate() - 7);
        break;
      }
      case SearchDateRange.ThreeWeeks: {
        startDate.setDate(startDate.getDate() - 21);
        break;
      }
      case SearchDateRange.OneMonth: {
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      }
      case SearchDateRange.ThreeMonths: {
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      }

      default:
        startDate.setFullYear(1);
        break;
    }
    return { startDate, endDate };
  }

  async findSearchResults(
    query: string,
    category: SearchCategories,
    user: User,
    startDate: Date,
    endDate: Date,
    limit: number,
    skip: number,
  ): Promise<SearchResult[]> {
    switch (category) {
      // case SearchCategories.Class:
      //   return await this.prismaService.$queryRaw<SearchResult[]>`
      //   SELECT id, email as title, 'class' as "resultType" FROM "User" WHERE "User".email ILIKE ${query}
      // `;

      case SearchCategories.Assignment: {
        if (user.role === Roles.TEACHER) {
          return await this.prismaService.$queryRaw<SearchResult[]>`
          SELECT id, title, description, 'assignment' as "resultType" FROM "Assignment" WHERE
          ("Assignment".title ILIKE ${query} OR "Assignment".description ILIKE ${query})
          AND ("Assignment"."userId"=${user.id} AND "Assignment"."createdAt" BETWEEN ${startDate} AND ${endDate})
          LIMIT ${limit} OFFSET ${skip};`;
        } else {
          const courseIds: string[] = await this.findCourseIdsByUser(user);

          return await this.prismaService.$queryRaw<SearchResult[]>`
          SELECT id, title, description, 'assignment' as "resultType" FROM "Assignment" WHERE
          ("Assignment".title ILIKE ${query} OR "Assignment".description ILIKE ${query})
          AND ("Assignment"."courseId" IN (${Prisma.join(
            courseIds,
          )}) AND "Assignment"."createdAt" BETWEEN ${startDate} AND ${endDate})
          LIMIT ${limit} OFFSET ${skip};`;
        }
      }

      case SearchCategories.Drive: {
        let folderIds = (
          await this.prismaService.sharedFolder.findMany({
            where: {
              sharedWithId: user.id,
            },
            select: {
              folderId: true,
            },
          })
        ).map((sharedFolder) => sharedFolder.folderId);

        let fileIds = (
          await this.prismaService.sharedFile.findMany({
            where: {
              sharedWithId: user.id,
            },
            select: {
              fileId: true,
            },
          })
        ).map((sharedFile) => sharedFile.fileId);

        if (!folderIds.length) {
          folderIds = [''];
        }
        if (!fileIds.length) {
          fileIds = [''];
        }

        return await this.prismaService.$queryRaw<SearchResult[]>`
        SELECT * FROM (SELECT id, name as title,color as description,'' as "filePath", 'drive' as "resultType" FROM "Folder" WHERE
        ("Folder".name ILIKE ${query} OR "Folder".color ILIKE ${query})
        AND ("Folder"."userId"=${user.id} OR "Folder".id IN (${Prisma.join(
          folderIds,
        )}) OR "Folder"."isHidden"=false OR "Folder"."parentFolderId" IN (${Prisma.join(
          folderIds,
        )}))
        AND "Folder"."createdAt" BETWEEN ${startDate} AND ${endDate}
        union
        SELECT id, name as title,'' as description,"filePath" as "filePath", 'drive' as "resultType" FROM "File" WHERE
        ("File".name ILIKE ${query})
        AND ("File"."userId"=${user.id} OR "File".id IN (${Prisma.join(
          fileIds,
        )}) OR "File"."folderId" IN (${Prisma.join(folderIds)}))
        AND "File"."createdAt" BETWEEN ${startDate} AND ${endDate}) As x LIMIT ${limit} OFFSET ${skip};
      `;
      }

      // case SearchCategories.Notification:
      //   return await this.prismaService.$queryRaw<SearchResult[]>`
      //   SELECT id, email as title, 'notification' as "resultType" FROM "User" WHERE "User".email ILIKE ${query}
      // `;

      case SearchCategories.Test: {
        const courseIds: string[] = await this.findCourseIdsByUser(user);

        return await this.prismaService.$queryRaw<SearchResult[]>`
        SELECT id, title, description, 'test' as "resultType" FROM "Test" WHERE
        ("Test".title ILIKE ${query} OR "Test".description ILIKE ${query})
        AND ("Test"."courseId" IN (${Prisma.join(
          courseIds,
        )}) AND "Test"."createdAt" BETWEEN ${startDate} AND ${endDate})
        LIMIT ${limit} OFFSET ${skip};`;
      }

      case SearchCategories.Grade: {
        const courseIds: string[] = await this.findCourseIdsByUser(user);
        return await this.prismaService.$queryRaw<SearchResult[]>`
        SELECT id, comment as title, cast(percentage as varchar) as description, 'grade' as "resultType" FROM "Grade" WHERE
        ("Grade".comment ILIKE ${query} OR cast("Grade".percentage as varchar) ILIKE ${query})
        AND ("Grade"."courseId" IN (${Prisma.join(
          courseIds,
        )}) AND "Grade"."createdAt" BETWEEN ${startDate} AND ${endDate})
        LIMIT ${limit} OFFSET ${skip};
      `;
      }

      case SearchCategories.Attendance: {
        const courseIds: string[] = await this.findCourseIdsByUser(user);
        return await this.prismaService.$queryRaw<SearchResult[]>`
        SELECT id, status as title, 'attendance' as "resultType" FROM "Attendance"
        WHERE cast("Attendance".status as varchar) ILIKE ${query} AND ("Attendance"."courseId" IN (${Prisma.join(
          courseIds,
        )}) AND "Attendance"."createdAt" BETWEEN ${startDate} AND ${endDate})
        LIMIT ${limit} OFFSET ${skip};
      `;
      }

      // case SearchCategories.Schedule:
      //   return await this.prismaService.$queryRaw<SearchResult[]>`
      //   SELECT id, email as title, 'schedule' as "resultType" FROM "User" WHERE "User".email ILIKE ${query}
      // `;
      case SearchCategories.Chat: {
        let groupIds = (
          await this.prismaService.userToUserMessageGroup.findMany({
            where: {
              userId: user.id,
            },
            select: {
              userMessageGroupId: true,
            },
          })
        ).map((el) => el.userMessageGroupId);

        if (!groupIds.length) {
          groupIds = [''];
        }

        return await this.prismaService.$queryRaw<SearchResult[]>`
        SElECT * FROM (SELECT id, name as title, '' as description, "filePath", 'chat' as "resultType" FROM "UserMessageGroup" WHERE
        "UserMessageGroup".name ILIKE ${query} AND ("UserMessageGroup"."createdBy"=${user.id
          } OR "UserMessageGroup"."id" IN (${Prisma.join(groupIds)}))
        AND "UserMessageGroup"."createdAt" BETWEEN ${startDate} AND ${endDate}
        union
        SELECT id, text as title, '' as description, "filePath", 'chat' as "resultType" FROM "PrivateMessage" WHERE
        ("PrivateMessage".text ILIKE ${query} AND ("PrivateMessage"."toId"=${user.id
          } OR "PrivateMessage"."fromId"=${user.id
          })) AND "PrivateMessage"."createdAt" BETWEEN ${startDate} AND ${endDate}
        union
        SELECT id, text as title, '' as description, "filePath", 'chat' as "resultType" FROM "GroupMessage" WHERE
        ("GroupMessage".text ILIKE ${query} AND ("GroupMessage"."userId"=${user.id
          } OR "GroupMessage"."messageGroupId" IN (${Prisma.join(groupIds)})))
        AND "GroupMessage"."createdAt" BETWEEN ${startDate} AND ${endDate}) As x LIMIT ${limit} OFFSET ${skip};
      `;
      }

      case SearchCategories.Calendar: {
        return await this.prismaService.$queryRaw<SearchResult[]>`
        SELECT id, title, description, 'calendar' as "resultType" FROM "CalendarEvent" WHERE
        ("CalendarEvent".title ILIKE ${query} OR "CalendarEvent".description ILIKE ${query})
        AND "CalendarEvent"."userId"=${user.id} AND "CalendarEvent"."createdAt" BETWEEN ${startDate} AND ${endDate}
        LIMIT ${limit} OFFSET ${skip};
      `;
      }

      case SearchCategories.Student: {
        const userIds: string[] = await this.findUserIdsByUser(user);
        return await this.prismaService.$queryRaw<SearchResult[]>`
        SELECT id, CONCAT("firstName",' ',"lastName") as title, email as description, "profilePicture" as "filePath", 'student' as "resultType" FROM "User" WHERE
        ("User".email ILIKE ${query} OR "User"."firstName" ILIKE ${query} OR "User"."lastName" ILIKE ${query} OR "User".phone ILIKE ${query})
        AND "User".id IN (${Prisma.join(
          userIds,
        )}) AND "User"."createdAt" BETWEEN ${startDate} AND ${endDate} LIMIT ${limit} OFFSET ${skip};
      `;
      }

      default:
        return [];
    }
  }

  async countSearchResults(
    query: string,
    category: SearchCategories,
    user: User,
    startDate: Date,
    endDate: Date,
  ) {
    switch (category) {
      case SearchCategories.Assignment: {
        if (user.role === Roles.TEACHER) {
          return await this.prismaService.$queryRaw`
          SELECT count(*) as total FROM "Assignment" WHERE
          ("Assignment".title ILIKE ${query} OR "Assignment".description ILIKE ${query})
          AND ("Assignment"."userId"=${user.id} AND "Assignment"."createdAt" BETWEEN ${startDate} AND ${endDate});`;
        } else {
          const courseIds: string[] = await this.findCourseIdsByUser(user);

          return await this.prismaService.$queryRaw`
          SELECT count(*) as total FROM "Assignment" WHERE
          ("Assignment".title ILIKE ${query} OR "Assignment".description ILIKE ${query})
          AND ("Assignment"."courseId" IN (${Prisma.join(
            courseIds,
          )}) AND "Assignment"."createdAt" BETWEEN ${startDate} AND ${endDate});`;
        }
      }

      case SearchCategories.Drive: {
        let folderIds = (
          await this.prismaService.sharedFolder.findMany({
            where: {
              sharedWithId: user.id,
            },
            select: {
              folderId: true,
            },
          })
        ).map((sharedFolder) => sharedFolder.folderId);

        let fileIds = (
          await this.prismaService.sharedFile.findMany({
            where: {
              sharedWithId: user.id,
            },
            select: {
              fileId: true,
            },
          })
        ).map((sharedFile) => sharedFile.fileId);

        if (!folderIds.length) {
          folderIds = [''];
        }
        if (!fileIds.length) {
          fileIds = [''];
        }

        return await this.prismaService.$queryRaw`
        SELECT count(*) as total FROM (
        SELECT id, name as title,color as description,'' as "filePath", 'drive' as "resultType" FROM "Folder" WHERE
        ("Folder".name ILIKE ${query} OR "Folder".color ILIKE ${query})
        AND ("Folder"."userId"=${user.id} OR "Folder".id IN (${Prisma.join(
          folderIds,
        )}) OR "Folder"."isHidden"=false OR "Folder"."parentFolderId" IN (${Prisma.join(
          folderIds,
        )}))
        AND "Folder"."createdAt" BETWEEN ${startDate} AND ${endDate}
        union
        SELECT id, name as title,'' as description,"filePath" as "filePath", 'drive' as "resultType" FROM "File" WHERE
        ("File".name ILIKE ${query})
        AND ("File"."userId"=${user.id} OR "File".id IN (${Prisma.join(
          fileIds,
        )}) OR "File"."folderId" IN (${Prisma.join(folderIds)}))
        AND "File"."createdAt" BETWEEN ${startDate} AND ${endDate}
        ) AS x
      `;
      }

      case SearchCategories.Test: {
        const courseIds: string[] = await this.findCourseIdsByUser(user);

        return await this.prismaService.$queryRaw`
        SELECT count(*) as total FROM "Test" WHERE
        ("Test".title ILIKE ${query} OR "Test".description ILIKE ${query})
        AND ("Test"."courseId" IN (${Prisma.join(
          courseIds,
        )}) AND "Test"."createdAt" BETWEEN ${startDate} AND ${endDate});`;
      }

      case SearchCategories.Grade: {
        const courseIds: string[] = await this.findCourseIdsByUser(user);
        return await this.prismaService.$queryRaw`
        SELECT count(*) as total FROM "Grade" WHERE
        ("Grade".comment ILIKE ${query} OR cast("Grade".percentage as varchar) ILIKE ${query})
        AND ("Grade"."courseId" IN (${Prisma.join(
          courseIds,
        )}) AND "Grade"."createdAt" BETWEEN ${startDate} AND ${endDate});
      `;
      }

      case SearchCategories.Attendance: {
        const courseIds: string[] = await this.findCourseIdsByUser(user);
        return await this.prismaService.$queryRaw`
        SELECT count(*) as total FROM "Attendance"
        WHERE cast("Attendance".status as varchar) ILIKE ${query} AND ("Attendance"."courseId" IN (${Prisma.join(
          courseIds,
        )}) AND "Attendance"."createdAt" BETWEEN ${startDate} AND ${endDate});
      `;
      }

      case SearchCategories.Chat: {
        let groupIds = (
          await this.prismaService.userToUserMessageGroup.findMany({
            where: {
              userId: user.id,
            },
            select: {
              userMessageGroupId: true,
            },
          })
        ).map((el) => el.userMessageGroupId);

        if (!groupIds.length) {
          groupIds = [''];
        }

        return await this.prismaService.$queryRaw`
        SELECT count(*) as total FROM (
        SELECT id, name as title, '' as description, "filePath", 'chat' as "resultType" FROM "UserMessageGroup" WHERE
        "UserMessageGroup".name ILIKE ${query} AND ("UserMessageGroup"."createdBy"=${user.id
          } OR "UserMessageGroup"."id" IN (${Prisma.join(groupIds)}))
        AND "UserMessageGroup"."createdAt" BETWEEN ${startDate} AND ${endDate}
        union
        SELECT id, text as title, '' as description, "filePath", 'chat' as "resultType" FROM "PrivateMessage" WHERE
        ("PrivateMessage".text ILIKE ${query} AND ("PrivateMessage"."toId"=${user.id
          } OR "PrivateMessage"."fromId"=${user.id
          })) AND "PrivateMessage"."createdAt" BETWEEN ${startDate} AND ${endDate}
        union
        SELECT id, text as title, '' as description, "filePath", 'chat' as "resultType" FROM "GroupMessage" WHERE
        ("GroupMessage".text ILIKE ${query} AND ("GroupMessage"."userId"=${user.id
          } OR "GroupMessage"."messageGroupId" IN (${Prisma.join(groupIds)})))
        AND "GroupMessage"."createdAt" BETWEEN ${startDate} AND ${endDate}
        ) AS x
      `;
      }

      case SearchCategories.Calendar: {
        return await this.prismaService.$queryRaw`
        SELECT count(*) as total FROM "CalendarEvent" WHERE
        ("CalendarEvent".title ILIKE ${query} OR "CalendarEvent".description ILIKE ${query})
        AND "CalendarEvent"."userId"=${user.id} AND "CalendarEvent"."createdAt" BETWEEN ${startDate} AND ${endDate};
      `;
      }

      case SearchCategories.Student: {
        const userIds: string[] = await this.findUserIdsByUser(user);
        return await this.prismaService.$queryRaw`
        SELECT count(*) as total FROM "User" WHERE
        ("User".email ILIKE ${query} OR "User"."firstName" ILIKE ${query} OR "User"."lastName" ILIKE ${query} OR "User".phone ILIKE ${query})
        AND "User".id IN (${Prisma.join(
          userIds,
        )}) AND "User"."createdAt" BETWEEN ${startDate} AND ${endDate};
      `;
      }

      default:
        return [{ total: 0 }];
    }
  }

  async search(
    searchInput: SearchInput,
    user: User,
    skip: number,
    limit: number,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const query = `%${searchInput.query}%`;
    const { startDate, endDate } = this.findDateLimits(searchInput.dateRange);
    if (searchInput.category === SearchCategories.All) {
      let results = [];
      let total = 0;
      let elementsToSkip = skip;
      let remainingElements = limit;

      for (const category in SearchCategories) {
        const currentSkip = elementsToSkip;
        if (SearchCategories[category] === SearchCategories.All) {
          continue;
        }
        const currentTotal = (
          await this.countSearchResults(
            query,
            SearchCategories[category],
            user,
            startDate,
            endDate,
          )
        )[0].total;
        total += currentTotal;

        if (elementsToSkip > 0) {
          elementsToSkip -= currentTotal;
          // eslint-disable-next-line max-depth
          if (elementsToSkip > 0) {
            continue;
          }
        }

        if (remainingElements > 0) {
          results = [
            ...results,
            ...(await this.findSearchResults(
              query,
              SearchCategories[category],
              user,
              startDate,
              endDate,
              remainingElements,
              currentSkip,
            )),
          ];
          remainingElements -= currentTotal;
        }
      }

      return {
        data: results,
        pageInfo: {
          total,
          skip,
          limit,
        },
      };
    } else {
      const { total } = (
        await this.countSearchResults(
          query,
          searchInput.category,
          user,
          startDate,
          endDate,
        )
      )[0];

      return {
        data: await this.findSearchResults(
          query,
          searchInput.category,
          user,
          startDate,
          endDate,
          limit,
          skip,
        ),
        pageInfo: {
          total,
          skip,
          limit,
        },
      };
    }
  }

  async countUsersByRole(user: User, role: Roles) {
    if (user.role !== Roles.CCSA && user.role !== Roles.CSA) {
      throw new ForbiddenException('You are not allowed');
    }

    const count = await this.prismaService.user.count({
      where: {
        role,
      },
    });

    return count;
  }

  // Public methods
  // Create Csa
  public async createCsa(createAdminInput: CreateAdminInput) {
    const exists = await this.checkIfUserExists(createAdminInput.email);

    if (exists) {
      await this.prismaService.user.update({
        where: {
          email: createAdminInput.email,
        },
        data: {
          role: 'CSA',
        },
      });

      return {
        status: ResponseStatus.SUCCESS,
        message: 'User updated role to CSA',
      };
    }

    const tempPassword = generateRandomAlphaNumericPassword();
    const hashedTempPassword = await hash(tempPassword);

    await this.prismaService.user.create({
      data: {
        email: createAdminInput.email,
        firstName: '',
        lastName: '',
        phone: '',
        role: Roles.CSA,
        password: hashedTempPassword,
      },
    });

    await this.sendConfirmPasswordEmail({
      email: createAdminInput.email,
      tempPassword,
    });

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Csa created successfully',
    };
  }

  // Create CCSA
  public async createCcsa(createCcsaInput: CreateAdminInput) {
    const userExists = await this.checkIfUserExists(createCcsaInput.email);

    const ccsaCount = await this.prismaService.user.count({
      where: {
        role: 'CCSA',
      },
    });

    if (ccsaCount >= 1) {
      throw new BadRequestException('Only one CCSA is allowed');
    }

    if (userExists) {
      await this.prismaService.user.update({
        where: {
          email: createCcsaInput.email,
        },
        data: {
          role: 'CCSA',
        },
      });

      return {
        status: ResponseStatus.SUCCESS,
        message: 'User updated role to CCSA',
      };
    }

    const tempPassword = generateRandomAlphaNumericPassword();
    const hashedTempPassword = await hash(tempPassword);

    await this.prismaService.user.create({
      data: {
        email: createCcsaInput.email,
        firstName: '',
        lastName: '',
        phone: '',
        role: Roles.CCSA,
        password: hashedTempPassword,
      },
    });

    await this.sendConfirmPasswordEmail({
      email: createCcsaInput.email,
      tempPassword,
    });

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Ccsa created successfully',
    };
  }

  // Create Principal District Admin
  public async createPda(createPdaInput: CreatePdaInput) {
    const userExist = await this.checkIfUserExists(createPdaInput.email);

    if (userExist) {
      await this.prismaService.user.update({
        where: {
          email: createPdaInput.email,
        },
        data: {
          email: createPdaInput.email,
          districtId: createPdaInput.districtId,
          role: 'PDA',
        },
      });

      return {
        status: ResponseStatus.SUCCESS,
        message: 'User updated role to PDA',
      };
    }

    const tempPassword = generateRandomAlphaNumericPassword();
    const hashedTempPassword = await hash(tempPassword);

    await this.prismaService.user.create({
      data: {
        email: createPdaInput.email,
        districtId: createPdaInput.districtId,
        firstName: null,
        lastName: null,
        phone: null,
        role: Roles.PDA,
        password: hashedTempPassword,
      },
    });

    await this.sendConfirmPasswordEmail({
      email: createPdaInput.email,
      tempPassword,
    });

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Pda created successfully',
    };
  }

  // Create District Admin
  public async createDa(createDaInput: CreatePdaInput) {
    const userExists = await this.checkIfUserExists(createDaInput.email);

    if (userExists) {
      await this.prismaService.user.update({
        where: {
          email: createDaInput.email,
        },
        data: {
          email: createDaInput.email,
          districtId: createDaInput.districtId,
          role: 'DA',
        },
      });

      return {
        status: ResponseStatus.SUCCESS,
        message: 'User updated role to DA',
      };
    }

    const tempPassword = generateRandomAlphaNumericPassword();
    const hashedTempPassword = await hash(tempPassword);

    await this.prismaService.user.create({
      data: {
        email: createDaInput.email,
        districtId: createDaInput.districtId,
        firstName: null,
        lastName: null,
        phone: null,
        role: Roles.DA,
        password: hashedTempPassword,
      },
    });

    await this.sendConfirmPasswordEmail({
      email: createDaInput.email,
      tempPassword,
    });

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Da created successfully',
    };
  }

  // Create Principal School Admin
  public async createPsa(createPsaInput: CreateUserInput) {
    const userExists = await this.checkIfUserExists(createPsaInput.email);

    if (userExists) {
      await this.prismaService.user.update({
        where: {
          email: createPsaInput.email,
        },
        data: {
          email: createPsaInput.email,
          schoolId: createPsaInput.schoolId,
          districtId: createPsaInput.districtId,
          role: 'PSA',
        },
      });
      return {
        status: ResponseStatus.SUCCESS,
        message: 'User updated role to PSA',
      };
    }

    const tempPassword = generateRandomAlphaNumericPassword();
    const hashedTempPassword = await hash(tempPassword);

    await this.prismaService.user.create({
      data: {
        email: createPsaInput.email,
        schoolId: createPsaInput.schoolId,
        districtId: createPsaInput.districtId,
        firstName: null,
        lastName: null,
        phone: null,
        role: Roles.PSA,
        password: hashedTempPassword,
      },
    });

    await this.sendConfirmPasswordEmail({
      email: createPsaInput.email,
      tempPassword,
    });

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Psa created successfully',
    };
  }

  // Create School Admin
  public async createSa(createSaInput: CreateUserInput) {
    const userExists = this.checkIfUserExists(createSaInput.email);

    if (userExists) {
      await this.prismaService.user.update({
        where: {
          email: createSaInput.email,
        },
        data: {
          email: createSaInput.email,
          schoolId: createSaInput.schoolId,
          districtId: createSaInput.districtId,
          role: 'SA',
        },
      });

      return {
        status: ResponseStatus.SUCCESS,
        message: 'User updated role to SA',
      };
    }

    const tempPassword = generateRandomAlphaNumericPassword();
    const hashedTempPassword = await hash(tempPassword);

    await this.prismaService.user.create({
      data: {
        email: createSaInput.email,
        schoolId: createSaInput.schoolId,
        districtId: createSaInput.districtId,
        firstName: null,
        lastName: null,
        phone: null,
        role: Roles.SA,
        password: hashedTempPassword,
      },
    });

    await this.sendConfirmPasswordEmail({
      email: createSaInput.email,
      tempPassword,
    });

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Sa created successfully, email is sent',
    };
  }

  // Create Teacher
  public async createTeacher(createTeacherInput: CreateUserInput) {
    const userEixsts = await this.checkIfUserExists(createTeacherInput.email);

    if (userEixsts) {
      await this.prismaService.user.update({
        where: {
          email: createTeacherInput.email,
        },
        data: {
          email: createTeacherInput.email,
          schoolId: createTeacherInput.schoolId,
          districtId: createTeacherInput.districtId,
          role: 'TEACHER',
        },
      });

      return {
        status: ResponseStatus.SUCCESS,
        message: 'User updated role to TEACHER',
      };
    }

    const tempPassword = generateRandomAlphaNumericPassword();
    const hashedTempPassword = await hash(tempPassword);

    await this.prismaService.user.create({
      data: {
        email: createTeacherInput.email,
        schoolId: createTeacherInput.schoolId,
        districtId: createTeacherInput.districtId,
        firstName: null,
        lastName: null,
        phone: null,
        role: Roles.TEACHER,
        password: hashedTempPassword,
      },
    });

    await this.sendConfirmPasswordEmail({
      email: createTeacherInput.email,
      tempPassword,
    });

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Teacher created successfully',
    };
  }

  // Create Parent
  public async createParent(createParentInput: CreateUserInput) {
    const userEixist = await this.checkIfUserExists(createParentInput.email);

    if (userEixist) {
      await this.prismaService.user.update({
        where: {
          email: createParentInput.email,
        },
        data: {
          email: createParentInput.email,
          schoolId: createParentInput.schoolId,
          districtId: createParentInput.districtId,
          role: 'PARENT',
        },
      });

      return {
        status: ResponseStatus.SUCCESS,
        message: 'User updated role to PARENT',
      };
    }

    const tempPassword = generateRandomAlphaNumericPassword();
    const hashedTempPassword = await hash(tempPassword);

    await this.prismaService.user.create({
      data: {
        email: createParentInput.email,
        schoolId: createParentInput.schoolId,
        districtId: createParentInput.districtId,
        firstName: null,
        lastName: null,
        phone: null,
        role: Roles.PARENT,
        password: hashedTempPassword,
      },
    });

    await this.sendConfirmPasswordEmail({
      email: createParentInput.email,
      tempPassword,
    });

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Parent created successfully',
    };
  }

  // Create Student
  public async createStudent(createStudentInput: CreateUserInput) {
    const userExist = await this.checkIfUserExists(createStudentInput.email);

    if (userExist) {
      await this.prismaService.user.update({
        where: {
          email: createStudentInput.email,
        },
        data: {
          email: createStudentInput.email,
          schoolId: createStudentInput.schoolId,
          districtId: createStudentInput.districtId,
          role: 'STUDENT',
        },
      });

      return {
        status: ResponseStatus.SUCCESS,
        message: 'User updated role to STUDENT',
      };
    }

    const tempPassword = generateRandomAlphaNumericPassword();
    const hashedTempPassword = await hash(tempPassword);

    await this.prismaService.user.create({
      data: {
        email: createStudentInput.email,
        schoolId: createStudentInput.schoolId,
        districtId: createStudentInput.districtId,
        firstName: null,
        lastName: null,
        phone: null,
        role: Roles.STUDENT,
        password: hashedTempPassword,
      },
    });

    await this.sendConfirmPasswordEmail({
      email: createStudentInput.email,
      tempPassword,
    });

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Student created successfully',
    };
  }

  // Get a specific user by ID
  public async findOne(currentUser: User, id: string) {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (foundUser.confidential && currentUser.id !== foundUser.id) {
      if (currentUser.role === Roles.PDA) {
        return foundUser;
      } else {
        throw new BadRequestException('User is confidential');
      }
    }

    return foundUser;
  }

  // get user by id
  public async findUserById(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            child: true,
          },
        },
        studentCourses: {
          include: {
            course: {
              include: {
                teacher: true,
              },
            },
          },
        },
      },
    });
  }

  // get public user by id
  public async findPublicUserById(id: string) {
    return await this.prismaService.user.findFirst({
      where: {
        id,
        profileAvailability: ProfileAvailability.PUBLIC,
        confidential: false,
      },
      include: {
        children: {
          include: {
            child: true,
          },
        },
        studentCourses: {
          include: {
            course: {
              include: {
                teacher: true,
              },
            },
          },
        },
      },
    });
  }

  // Get a specific user by email
  public async findOneByEmail(currentUser: User, email: string) {
    const foundUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (foundUser.confidential && currentUser.email !== foundUser.email) {
      if (currentUser.role === Roles.PDA) {
        return foundUser;
      } else {
        throw new BadRequestException('User is confidential');
      }
    }

    return foundUser;
  }

  // Get a list of users by districtId
  public async findManyByDistrictId(
    districtId: string,
    skip: number,
    limit: number,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const where = {
      districtId,
    };
    const total = await this.prismaService.user.count({ where });
    const data = await this.prismaService.user.findMany({
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

  // Get a list of users by schoolId
  public async findManyBySchoolId(
    schoolId: string,
    skip: number,
    limit: number,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const where = {
      schoolId,
    };
    const total = await this.prismaService.user.count({ where });
    const data = await this.prismaService.user.findMany({
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

  async isAllowed(user: User, schoolId: string) {
    if (user.role === Roles.CCSA || user.role === Roles.CSA) {
      return true;
    }

    const school = await this.prismaService.school.findUnique({
      where: { id: schoolId },
    });

    if (
      (user.role === Roles.DA || user.role === Roles.PDA) &&
      school.districtId === user.districtId
    ) {
      return true;
    }
    if (
      (user.role === Roles.SA || user.role === Roles.PSA) &&
      schoolId === user.schoolId
    ) {
      return true;
    }

    return false;
  }

  // get teachers in school
  public async findTeachersBySchoolId(
    currentUser: User,
    schoolId: string,
    skip: number,
    limit: number,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (!this.isAllowed(currentUser, schoolId)) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }

    const where = {
      schoolId,
      role: Roles.TEACHER,
    };

    const total = await this.prismaService.user.count({ where });
    const data = await this.prismaService.user.findMany({
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
  // Setup Two Factor Authentication
  public async setupTfa(currentUser: User) {
    console.log(currentUser.tfaSecret);
    if (currentUser.tfaSecret) {
      throw new BadRequestException(
        'User has already setup Two Factor Authentication',
      );
    }
    const QRUrl = await this.twoFactorAuthService.generateTwoFactorAuthSecret(
      currentUser.email,
    );

    return {
      qrCode: QRUrl,
    };
  }

  // get teachers in school
  public async findStudentsBySchoolId(
    currentUser: User,
    schoolId: string,
    skip: number,
    limit: number,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (!this.isAllowed(currentUser, schoolId)) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }

    const where = {
      schoolId,
      role: Roles.STUDENT,
    };

    const total = await this.prismaService.user.count({ where });
    const data = await this.prismaService.user.findMany({
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

  // Enable Two Factor Authentication
  public async enableTfa(currentUser: User, enableTfaInput: EnableTfaInput) {
    if (currentUser.tfaEnabled) {
      throw new BadRequestException(
        'User has already enabled Two Factor Authentication',
      );
    }

    const isCodeValid = this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
      enableTfaInput.tfaCode,
      currentUser.tfaSecret,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    await this.twoFactorAuthService.turnOnTwoFactorAuthentication(
      currentUser.id,
    );

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Two Factor Authentication successfully enabled',
    };
  }

  // Verify Two Factor Authentication Token
  public async verifyTfaToken(
    currentUser: User,
    verifyTfaInput: EnableTfaInput,
  ) {
    const isCodeValid = this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
      verifyTfaInput.tfaCode,
      currentUser.tfaSecret,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Two Factor Authentication Token successfully verified',
    };
  }

  countTeachersInSchool(currentUser: User, schoolId: string) {
    if (!this.isAllowed(currentUser, schoolId)) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }

    return this.prismaService.user.count({
      where: {
        schoolId,
        role: Roles.TEACHER,
      },
    });
  }

  countStudentsInSchool(currentUser: User, schoolId: string) {
    if (!this.isAllowed(currentUser, schoolId)) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }

    return this.prismaService.user.count({
      where: {
        schoolId,
        role: Roles.STUDENT,
      },
    });
  }

  async remove(id: string, token: string) {
    const userExists = this.prismaService.user.findUnique({ where: { id } });

    if (!userExists) {
      throw new Error('User does not exist');
    }

    const data = await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        deleted: true,
        deletedTime: new Date(),
      },
    });

    // if (data.profilePicture || data.bannerPicture){
    //   await this.removeFiles(
    //     data.profilePicture && data.bannerPicture ? [data.profilePicture,data.bannerPicture]
    //     : [data.profilePicture || data.bannerPicture],
    //     token
    //   );
    // }

    return data;

  }

  async updateUser(user: User, updateUser: UpdateUserInput, token: string) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        id: updateUser.id,
      },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    const userUpdateObj = { ...updateUser, profilePicture: undefined, bannerPicture: undefined, removeBanner: undefined, removeProfile: undefined };

    if (updateUser.bannerPicture || updateUser.profilePicture) {
      const { urls } = await this.uploadFiles(
        updateUser.bannerPicture && updateUser.profilePicture ?
          [updateUser.bannerPicture, updateUser.profilePicture]
          : updateUser.bannerPicture ? [updateUser.bannerPicture]
            : [updateUser.profilePicture],
        token,
        updateUser.id
      );

      const updateObj = updateUser.bannerPicture &&
        updateUser.profilePicture ? {
        bannerPicture: urls[0],
        profilePicture: urls[1],
      } : updateUser.bannerPicture ? {
        bannerPicture: urls[0],
      } : {
        profilePicture: urls[0],
      };

      await this.prismaService.user.update({
        where: {
          id: updateUser.id,
        },
        data: updateObj,
      });

      let filesToRemove = null;
      if (updateUser.bannerPicture && updateUser.profilePicture) {
        if (userExists.bannerPicture || userExists.profilePicture) {
          filesToRemove =
            userExists.bannerPicture && userExists.profilePicture
              ? [userExists.bannerPicture, userExists.profilePicture]
              : userExists.bannerPicture
                ? [userExists.bannerPicture]
                : [userExists.profilePicture];
        }
        userUpdateObj.bannerPicture = urls[0];
        userUpdateObj.profilePicture = urls[1];
      } else if (updateUser.bannerPicture) {
        if (userExists.bannerPicture) {
          filesToRemove = [userExists.bannerPicture];
        }
        userUpdateObj.bannerPicture = urls[0];
      } else {
        if (userExists.profilePicture) {
          filesToRemove = [userExists.profilePicture];
        }
        userUpdateObj.profilePicture = urls[0];
      }

      if (filesToRemove) {
        await this.removeFiles(filesToRemove, token);
      }
    }

    if (
      (updateUser.removeBanner || updateUser.removeProfile) &&
      (userExists.bannerPicture || userExists.profilePicture)
    ) {
      let filesToRemove = null;
      if (updateUser.removeBanner && updateUser.removeProfile) {
        filesToRemove = [userExists.bannerPicture, userExists.profilePicture];
        userUpdateObj.bannerPicture = null;
        userUpdateObj.profilePicture = null;
      } else if (updateUser.removeBanner) {
        filesToRemove = [userExists.bannerPicture];
        userUpdateObj.bannerPicture = null;
      } else {
        filesToRemove = [userExists.profilePicture];
        userUpdateObj.profilePicture = null;
      }

      if (filesToRemove) {
        await this.removeFiles(filesToRemove, token);
      }
    }

    return this.prismaService.user.update({
      data: {
        ...userUpdateObj,
      },
      where: {
        id: updateUser.id,
      },
    });
  }

  async updateUserRole(userId: string, role: Roles) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (userExists.role === role) {
      throw new BadRequestException('User already has this role');
    }

    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
    });
  }

  /**
   * @private send email helper
   * @param email password
   *
   */
  async sendConfirmPasswordEmail({
    email,
    tempPassword,
  }: {
    email: string;
    tempPassword: string;
  }) {
    const mail = {
      to: email,
      from: 'no-reply@gradearc.com',
      templateId: 'd-157bf0d2f4834e3b921ded871f8b24f9',
      dynamicTemplateData: {
        email,
        tempPassword,
      },
    };
    return await this.sendgridService.send(mail);
  }

  async makeAccountConfidential(user: User, id: string) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!userExists) {
      throw new NotFoundException('User does not exist');
    }

    if (
      user.role !== Roles.CCSA &&
      user.role !== Roles.CSA &&
      !user.confidential
    ) {
      throw new BadRequestException(
        'User is not authorized to make account confidential',
      );
    }

    return this.prismaService.user.update({
      where: { id },
      data: {
        confidential: !userExists.confidential,
      },
    });
  }

  async getDashboardData(user: User): Promise<DashboardDTO> {
    // total courses
    const totalCourses = await this.prismaService.studentToCourse.count({
      where: {
        studentId: user.id,
      },
    });

    // missed assignments
    const missedAssignments = await this.prismaService.assignment.count({
      where: {
        due: {
          lt: new Date(),
        },
        submissions: {
          none: {
            submitterId: user.id,
          },
        },
      },
    });

    // completed assignments
    const completedAssignments = await this.prismaService.assignment.count({
      where: {
        due: {
          gt: new Date(),
        },
        submissions: {
          some: {
            submitterId: user.id,
          },
        },
      },
    });

    // due assignments
    const dueAssignments = await this.prismaService.assignment.count({
      where: {
        due: {
          equals: new Date(),
        },
      },
    });

    return {
      dueAssignments,
      completedAssignments,
      missedAssignments,
      totalCourses,
    };
  }

  // get all users by CSA
  async getAllUsersByCSA(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (user.role !== Roles.CCSA && user.role !== Roles.CSA) {
      throw new ForbiddenException('You are not allowed');
    }

    const total = await this.prismaService.user.count({});
    const data = await this.prismaService.user.findMany({
      include: {
        school: true,
        district: true,
      },
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

  // get all public users
  async getAllPublicUsers(skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const where = {
      profileAvailability: ProfileAvailability.PUBLIC,
      confidential: false,
    };
    const total = await this.prismaService.user.count({ where });
    const data = await this.prismaService.user.findMany({
      where,
      include: {
        school: true,
        district: true,
      },
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

  async uploadFiles(
    files: GraphQLUpload[],
    token: string,
    userId: string,
  ): Promise<{ urls: string[] }> {
    const formData = new FormData();

    formData.append(
      'path',
      await this.fileUploadService.getDynamicFilePath(
        FileType.UserOtherFile,
        userId,
      ),
    );
    formData.append('public', 'true');

    for (const file of files) {
      const { createReadStream, mimetype, filename } = await file;

      formData.append('files', createReadStream(), {
        filename,
        contentType: mimetype,
      });
    }

    const { urls } = await this.fileUploadService.upload(formData, token, true);

    return { urls };
  }
  async removeFiles(files: string[], token: string) {
    const deleteMultiple = files.length > 1;
    const paths = deleteMultiple
      ? files.map((file) => {
        return file.split(process.env.FILE_API_CDN_URL + '/')[1];
      })
      : [files[0]];

    await this.fileUploadService.delete(
      paths.join('&paths='),
      token,
      deleteMultiple,
    );
  }
}
