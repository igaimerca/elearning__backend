/* eslint-disable eol-last */
/* eslint-disable max-depth */
/* eslint-disable max-len */
/* eslint-disable max-statements */
/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Roles, AttendType } from '@prisma/client';

import { PrismaService } from '../../database/services/prisma.service';
import { CreateAttendanceInput } from './dto/create-attendance.input';
// eslint-disable-next-line max-len
import { CreateManyAttendancesInput } from './dto/create-many-attendances.input';
import { UpdateAttendanceInput } from './dto/update-attendance.input';
import { User } from '../users/entities/user.entity';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';

@Injectable()
export class AttendanceService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(user: User, createAttendanceInput: CreateAttendanceInput) {
    const studentExists = await this.prismaService.user.findUnique({
      where: { id: createAttendanceInput.userId },
    });

    if (!studentExists) {
      throw new BadRequestException(
        `Student with ID ${createAttendanceInput.userId} does not exist`,
      );
    }

    if (studentExists.role !== Roles.STUDENT) {
      throw new BadRequestException(
        `User with ID ${createAttendanceInput.userId} is not a student`,
      );
    }

    if (user.schoolId !== studentExists.schoolId) {
      throw new ForbiddenException(
        // eslint-disable-next-line max-len
        `Teacher with ID ${user.id} can not create the attendance for student with ID ${createAttendanceInput.userId}`,
      );
    }

    const courseExists = await this.prismaService.course.findUnique({
      where: { id: createAttendanceInput.courseId },
    });

    if (!courseExists) {
      throw new BadRequestException(
        `Course with ID ${createAttendanceInput.courseId} does not exist`,
      );
    }

    if (courseExists.teacherId !== user.id) {
      throw new ForbiddenException(
        // eslint-disable-next-line max-len
        `Teacher with ID ${user.id} can not create the attendance for course with ID ${createAttendanceInput.courseId}`,
      );
    }

    const attendanceExists = await this.prismaService.attendance.findFirst({
      where: {
        userId: createAttendanceInput.userId,
        courseId: createAttendanceInput.courseId,
        day: createAttendanceInput.day,
      },
    });

    if (attendanceExists) {
      throw new ForbiddenException('Attendance exists already');
    }

    return this.prismaService.attendance.create({
      data: {
        ...createAttendanceInput,
      },
    });
  }

  async createMany(
    user: User,
    createManyAttendancesInput: CreateManyAttendancesInput,
  ) {
    const courseExists = await this.prismaService.course.findUnique({
      where: { id: createManyAttendancesInput.courseId },
    });

    if (!courseExists) {
      throw new BadRequestException(
        `Course with ID ${createManyAttendancesInput.courseId} does not exist`,
      );
    }

    if (courseExists.teacherId !== user.id) {
      throw new ForbiddenException(
        // eslint-disable-next-line max-len
        `Teacher with ID ${user.id} can not create the attendance for course with ID ${createManyAttendancesInput.courseId}`,
      );
    }

    const studentsExist = await this.prismaService.user.findMany({
      where: { id: { in: createManyAttendancesInput.userIds } },
    });

    if (studentsExist.length !== createManyAttendancesInput.userIds.length) {
      throw new BadRequestException('Some users do not exist');
    }

    const nonStudentExists = studentsExist.some(
      (student) => student.role !== Roles.STUDENT,
    );
    if (nonStudentExists) {
      throw new ForbiddenException('Some users are not a student');
    }

    const nonSchoolStudentExists = studentsExist.some(
      (student) => student.schoolId !== user.schoolId,
    );
    if (nonSchoolStudentExists) {
      throw new ForbiddenException(
        'Some users are not a student of this school',
      );
    }

    const attendanceExist = await this.prismaService.attendance.findFirst({
      where: {
        userId: { in: createManyAttendancesInput.userIds },
        courseId: createManyAttendancesInput.courseId,
        day: createManyAttendancesInput.day,
      },
    });
    if (attendanceExist) {
      throw new ForbiddenException('Attendance exists already');
    }

    const newAttendances = createManyAttendancesInput.userIds.map((userId) => ({
      courseId: createManyAttendancesInput.courseId,
      userId,
      status: AttendType.PRESENT,
      day: createManyAttendancesInput.day,
    }));

    return this.prismaService.attendance.createMany({
      data: newAttendances,
    });
  }

  async findMany(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (user.role === Roles.STUDENT || user.role === Roles.PARENT) {
      throw new ForbiddenException('You are not authorized to get attendances');
    }

    const include = {
      user: true,
      course: true,
    };

    if (
      user.role === Roles.PSA ||
      user.role === Roles.SA ||
      user.role === Roles.TEACHER
    ) {
      const where = {
        user: { schoolId: user.schoolId },
      };
      const total = await this.prismaService.attendance.count({ where });
      const data = await this.prismaService.attendance.findMany({
        where,
        include,
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

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      const where = {
        user: { districtId: user.districtId },
      };
      const total = await this.prismaService.attendance.count({ where });
      const data = await this.prismaService.attendance.findMany({
        where,
        include,
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

    const total = await this.prismaService.attendance.count({});
    const data = await this.prismaService.attendance.findMany({
      include,
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

  async findManyByDay(user: User, day: Date, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (user.role === Roles.STUDENT || user.role === Roles.PARENT) {
      throw new ForbiddenException('You are not authorized to get attendances');
    }

    const include = {
      user: true,
      course: true,
    };

    if (
      user.role === Roles.PSA ||
      user.role === Roles.SA ||
      user.role === Roles.TEACHER
    ) {
      const where = {
        user: { schoolId: user.schoolId },
        day,
      };
      const total = await this.prismaService.attendance.count({ where });
      const data = await this.prismaService.attendance.findMany({
        where,
        include,
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

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      const where = {
        user: { districtId: user.districtId },
        day,
      };
      const total = await this.prismaService.attendance.count({ where });
      const data = await this.prismaService.attendance.findMany({
        where,
        include,
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

    const where = { day };
    const total = await this.prismaService.attendance.count({ where });
    const data = await this.prismaService.attendance.findMany({
      where,
      include,
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

  async findManyByCourse(
    user: User,
    courseId: string,
    skip: number,
    limit: number,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (user.role === Roles.STUDENT || user.role === Roles.PARENT) {
      throw new ForbiddenException('You are not authorized to get attendances');
    }

    const include = {
      user: true,
      course: true,
    };

    if (
      user.role === Roles.PSA ||
      user.role === Roles.SA ||
      user.role === Roles.TEACHER
    ) {
      const where = {
        user: { schoolId: user.schoolId },
        courseId,
      };
      const total = await this.prismaService.attendance.count({ where });
      const data = await this.prismaService.attendance.findMany({
        where,
        include,
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

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      const where = {
        user: { districtId: user.districtId },
        courseId,
      };
      const total = await this.prismaService.attendance.count({ where });
      const data = await this.prismaService.attendance.findMany({
        where,
        include,
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

    const where = { courseId };
    const total = await this.prismaService.attendance.count({ where });
    const data = await this.prismaService.attendance.findMany({
      where,
      include,
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

  async findManyByDistrict(user: User, districtId: string, status: AttendType) {
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

    const result = new Array(12).fill({}).map((_, i) => {
      return { month: i, count: 0 };
    });

    const studentCount = await this.prismaService.user.count({
      where: {
        districtId,
        role: Roles.STUDENT,
      },
    });

    const firstDay = new Date(new Date().getFullYear() - 1, 11, 31);
    const lastDay = new Date(new Date().getFullYear() + 1, 0, 1);

    const data = await this.prismaService.attendance.groupBy({
      where: {
        user: { districtId: user.districtId },
        status,
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      by: ['day'],
      _count: {
        _all: true,
      },
    });

    data.map((item) => {
      const day = new Date(item.day);
      const month = day.getMonth();
      result[month].count += item._count._all;
    });

    return result.map((item) => {
      return {
        month: item.month,
        percentage: Math.round((item.count / studentCount) * 100),
      };
    });
  }

  async findManyBySchool(user: User, schoolId: string, status: AttendType) {
    const schoolExists = await this.prismaService.school.findUnique({
      where: {
        id: schoolId,
      },
    });

    if (!schoolExists) {
      throw new NotFoundException('School does not exist');
    }
    if (
      user.role !== Roles.CCSA &&
      user.role !== Roles.CSA &&
      user.role !== Roles.PDA &&
      user.role !== Roles.DA &&
      user.role !== Roles.PSA &&
      user.role !== Roles.SA
    ) {
      throw new ForbiddenException('You are not allowed');
    }

    if (
      (user.role === Roles.PDA || user.role === Roles.DA) &&
      user.districtId !== schoolExists.districtId
    ) {
      throw new ForbiddenException('You are not allowed');
    }

    if (
      (user.role === Roles.PSA || user.role === Roles.SA) &&
      user.schoolId !== schoolId
    ) {
      throw new ForbiddenException('You are not allowed');
    }

    const result = new Array(12).fill({}).map((_, i) => {
      return { month: i, count: 0 };
    });

    const studentCount = await this.prismaService.user.count({
      where: {
        schoolId: schoolId,
        role: Roles.STUDENT,
      },
    });

    const firstDay = new Date(new Date().getFullYear() - 1, 11, 31);
    const lastDay = new Date(new Date().getFullYear() + 1, 0, 1);

    const data = await this.prismaService.attendance.groupBy({
      where: {
        user: { districtId: user.districtId },
        status,
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      by: ['day'],
      _count: {
        _all: true,
      },
    });

    data.map((item) => {
      const day = new Date(item.day);
      const month = day.getMonth();
      result[month].count += item._count._all;
    });

    return result.map((item) => {
      return {
        month: item.month,
        percentage: Math.round((item.count / studentCount) * 100),
      };
    });
  }

  async findOne(user: User, id: string) {
    const attendanceExists = await this.prismaService.attendance.findUnique({
      where: { id },
      include: {
        user: {
          include: { parents: true },
        },
        course: true,
      },
    });

    if (!attendanceExists) {
      throw new BadRequestException(`Attendance with ID ${id} does not exist`);
    }

    if (
      user.role === Roles.PSA ||
      user.role === Roles.SA ||
      user.role === Roles.TEACHER
    ) {
      if (attendanceExists.user.schoolId !== user.schoolId) {
        throw new ForbiddenException(
          'You are not authorized to get this attendance',
        );
      }

      return attendanceExists;
    }

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      if (attendanceExists.user.districtId !== user.districtId) {
        throw new ForbiddenException(
          'You are not authorized to get this attendance',
        );
      }

      return attendanceExists;
    }

    if (user.role === Roles.STUDENT) {
      if (attendanceExists.userId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to get this attendance',
        );
      }

      return attendanceExists;
    }

    if (user.role === Roles.PARENT) {
      if (
        !attendanceExists.user.parents.some(
          (childParent) => childParent.parentId === user.id,
        )
      ) {
        throw new ForbiddenException(
          'You are not authorized to get this attendance',
        );
      }

      return attendanceExists;
    }

    return attendanceExists;
  }

  async update(user: User, updateAttendanceInput: UpdateAttendanceInput) {
    const attendanceExists = await this.prismaService.attendance.findUnique({
      where: { id: updateAttendanceInput.id },
      include: {
        user: true,
        course: true,
      },
    });

    if (!attendanceExists) {
      throw new BadRequestException(
        `Attendance with ID ${updateAttendanceInput.id} does not exist`,
      );
    }

    if (user.role !== Roles.PSA && user.role !== Roles.SA) {
      throw new ForbiddenException(
        'You are not authorized to update this attendance',
      );
    }

    if (attendanceExists.user.schoolId !== user.schoolId) {
      throw new ForbiddenException(
        'You are not authorized to update this attendance',
      );
    }

    return this.prismaService.attendance.update({
      where: { id: updateAttendanceInput.id },
      data: {
        ...updateAttendanceInput,
      },
    });
  }
  //Add method to get Students list with Average Grade, Missing Assignments count, Present count, Tardy count, Absent count current teacher teaches
  async studentsListWithAverageGradeMissingAssignmentsPresentCountTardyAbsentCount(
    user: User,
    courseId: string
  ) {
    //authorized
    if (user.role !== Roles.TEACHER) {
      throw new ForbiddenException(
        'You are not authorized to get attendances list of students',
      );
    }
    //if no course id
    if (!courseId) {
      throw new BadRequestException('Course id is required');
    }
    //course exists
    const courseExists = await this.prismaService.course.findUnique({
      where: { id: courseId },
    });
    if (!courseExists) {
      throw new BadRequestException('Course does not exist');
    }
    //checking if logged in teacher is the owner of given course
    if (courseExists.teacherId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to get attendances list of students for this course',
      );
    }
    //getting student from attendance due to given course id
    //array to store data
    const attendances = await this.prismaService.attendance.findMany({
      where: {
        courseId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true,
            id: true,
          },
        },
      },
    });
    const data = attendances.map(async (item) => {
      //getting presnt count where course id is equal to item.courseId and status is present
      const presentCount = await this.prismaService.attendance.count({
        where: {
          userId: item.user.id,
          courseId: item.courseId,
          status: AttendType.PRESENT,
        },
      });
      //getting tardy count where course id is equal to item.courseId and status is tardy
      const tardyCount = await this.prismaService.attendance.count({
        where: {
          userId: item.user.id,
          courseId: item.courseId,
          status: AttendType.TARDY,
        },
      });
      //getting absent count where course id is equal to item.courseId and status is absent
      const absentCount = await this.prismaService.attendance.count({
        where: {
          userId: item.user.id,
          courseId: item.courseId,
          status: AttendType.ABSENT,
        },
      });
      //finding total assignment for this courseId
      const totalAssignment = await this.prismaService.assignment.count({
        where: {
          courseId: {
            in: item.courseId
          }
        }
      });
      //finding total submission for this student for this courseId
      const totalSubmission = await this.prismaService.submission.count({
        where: {
          submitterId: item.user.id,
          assignment: {
            courseId: {
              in: item.courseId
            }
          }
        }
      });
      const missedAssignments = totalAssignment - totalSubmission;
      return {
        firstName: item.user.firstName || '',
        lastName: item.user.lastName || '',
        profilePicture: item.user.profilePicture || '',
        id: item.user.id || '',
        missedAssignments: missedAssignments || 0,
        present: presentCount || 0,
        tardy: tardyCount || 0,
        absent: absentCount || 0,
        averageGrade: 0
      };
    });
    return data;
  }

  async findDailyCourseAttendance(user, courseId) {
    const courseExists = await this.prismaService.course.findUnique({
      where: { id: courseId },
    });
    if (!courseExists) {
      throw new NotFoundException('Course doesnot Exist');
    }
    if (user.role !== Roles.TEACHER) {
        throw new ForbiddenException('You are not authorized to get attendances');
      }

      const result = new Array(7).fill({}).map((_, i) => {
        return { day: i+1, attendance: 0 };
      });

      const date = new Date();
      date.setDate(date.getDate() - (date.getDay() + 1));

      const firstDay = new Date(date);
      date.setDate(date.getDate() + 8);

      const lastDay = new Date(date);

      const data = await this.prismaService.attendance.groupBy({
        where: {
          courseId,
          status: AttendType.PRESENT,
          createdAt: {
            gte: firstDay,
            lte: lastDay,
          },
        },
        by: ['createdAt'],
        _count: {
          _all: true
        },
      });

      data.forEach(item => {
        const day = new Date(item.createdAt).getDay();
        result[day]. attendance += item._count._all;
      });

      return result;
  }
}
//todo finding average grade for each student