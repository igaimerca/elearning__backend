/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Roles } from '@prisma/client';

import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { PrismaService } from '../../database/services/prisma.service';
import { generateCourseCode } from '../../utils/password';
import { User } from '../users/entities/user.entity';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import * as FormData from 'form-data';
import { FileUploadService } from '../../fileUpload/fileUpload.service';
import { FileType } from '../../common/enums/fileType.enum';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { createFind } from 'rxjs/internal/operators/find';
import { use } from 'passport';
import { ForbiddenError } from 'apollo-server-express';
import { Courses } from './entities/courses.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CourseService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
    private readonly eventEmitter:EventEmitter2,
  ) {}

  // Public Methods
  public async createCourse(
    createCourseInput: CreateCourseInput,
    token?: string,
    user?: User,
    file?: GraphQLUpload,
  ) {
    const courseCode = generateCourseCode();
    if (file) {
      const { createReadStream, mimetype, filename } = file;

      const formData = new FormData();
      formData.append('file', createReadStream(), {
        filename,
        contentType: mimetype,
      });
      formData.append(
        'path',
        await this.fileUploadService.getDynamicFilePath(
          FileType.CourseMaterialFile,
          user.id,
          courseCode,
        ),
      );
      formData.append('public', 'true');

      const { url } = await this.fileUploadService.upload(formData, token);

      createCourseInput.picture = url;
    }

    return this.prismaService.course.create({
      data: {
        ...createCourseInput,
        courseCode,
      },
    });
  }

  public async getSingleCourse(user: User, id: string) {
    const courseExists = await this.prismaService.course.findUnique({
      where: { id },
      include: {
        school: true,
      },
    });

    if (user.role === Roles.CCSA || user.role === Roles.CSA) {
      return courseExists;
    } else if (user.role === Roles.PDA || user.role === Roles.DA) {
      if (courseExists.school.districtId === user.districtId) {
        return courseExists;
      }
    } else if (courseExists.schoolId === user.schoolId) {
      return courseExists;
    }

    throw new ForbiddenException('You are not authorized');
  }

  public async getAllCourses(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    let where = {};
    if (user.role === Roles.CCSA || user.role === Roles.CSA) {
      where = {};
    } else if (user.role === Roles.PDA || user.role === Roles.DA) {
      where = {
        school: {
          districtId: user.districtId,
        },
      };
    } else if (user.role === Roles.PSA || user.role === Roles.SA) {
      where = {
        schoolId: user.schoolId,
      };
    } else if (user.role === Roles.TEACHER) {
      where = {
        teacherId: user.id,
      };
    } else if (user.role === Roles.STUDENT) {
      where = {
        students: {
          some: {
            studentId: user.id,
          },
        },
      };
    } else if (user.role === Roles.PARENT) {
      const relations = await this.prismaService.parentChild.findMany({
        where: {
          parentId: user.id,
        },
      });
      const childIds = relations.map((ele) => ele.childId);
      where = {
        students: {
          some: {
            studentId: { in: childIds },
          },
        },
      };
    }

    const total = await this.prismaService.course.count({ where });
    const data = await this.prismaService.course.findMany({
      where,
      include: {
        school: true,
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

  public async countCoursesOfSchool(schoolId: string, currentUser: User) {
    if (!this.isAllowed(currentUser, schoolId)) {
      throw new ForbiddenException('You are not authorized');
    }

    return this.prismaService.course.count({
      where: {
        schoolId,
      },
    });
  }

  // eslint-disable-next-line max-statements
  public async updateCourse(
    user: User,
    updateCourseInput: UpdateCourseInput,
    token?: string,
    file?: GraphQLUpload,
  ) {
    const courseExists = await this.prismaService.course.findUnique({
      where: { id: updateCourseInput.id },
      include: { school: true },
    });

    if (!courseExists) {
      throw new NotFoundException('Course does not exist');
    }

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      if (courseExists.school.districtId !== user.districtId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (
      user.role === Roles.PSA ||
      user.role === Roles.SA ||
      user.role === Roles.TEACHER
    ) {
      if (courseExists.schoolId !== user.schoolId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.STUDENT || user.role === Roles.PARENT) {
      throw new ForbiddenException('You are not authorized');
    }

    if (file) {
      const { createReadStream, mimetype, filename } = file;

      const formData = new FormData();
      formData.append('file', createReadStream(), {
        filename,
        contentType: mimetype,
      });
      formData.append(
        'path',
        await this.fileUploadService.getDynamicFilePath(
          FileType.CourseMaterialFile,
          user.id,
          courseExists.courseCode,
        ),
      );
      formData.append('public', 'true');

      const { url } = await this.fileUploadService.upload(formData, token);

      updateCourseInput.picture = url;

      if (courseExists.picture) {
        await this.fileUploadService.delete(courseExists.picture, token);
      }
    }

    return this.prismaService.course.update({
      where: { id: updateCourseInput.id },
      data: {
        ...updateCourseInput,
      },
    });
  }

  public async deleteCourse(user: User, id: string, token: string) {
    const courseExists = await this.prismaService.course.findUnique({
      where: { id },
      include: { school: true },
    });

    if (!courseExists) {
      throw new NotFoundException('Course does not exist');
    }

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      if (courseExists.school.districtId !== user.districtId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.PSA || user.role === Roles.SA) {
      if (courseExists.schoolId !== user.schoolId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (
      user.role === Roles.TEACHER ||
      user.role === Roles.STUDENT ||
      user.role === Roles.PARENT
    ) {
      throw new ForbiddenException('You are not authorized');
    }
    const data = await this.prismaService.course.delete({
      where: {
        id,
      },
    });
    if (data.picture) {
      await this.fileUploadService.delete(data.picture, token);
    }
    return data;
  }

  // eslint-disable-next-line max-statements
  public async enrollStudent(
    user: User,
    courseCode: string,
    studentId: string,
  ) {
    const courseExists = await this.prismaService.course.findUnique({
      where: {
        courseCode,
      },
      include: {
        school: true,
        students: true,
      },
    });

    if (!courseExists) {
      throw new NotFoundException(`Course with code ${courseCode} not found`);
    }
    const studentExists = await this.prismaService.user.findUnique({
      where: {
        id: studentId,
      },
    });
    if (!studentExists) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    if (courseExists.schoolId !== studentExists.schoolId) {
      throw new ForbiddenException('You are not authorized');
    }

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      if (courseExists.school.districtId !== user.districtId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (
      user.role === Roles.PSA ||
      user.role === Roles.SA ||
      user.role === Roles.TEACHER
    ) {
      if (courseExists.schoolId !== user.schoolId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.STUDENT || user.role === Roles.PARENT) {
      throw new ForbiddenException('You are not authorized');
    }

    const studentFound = courseExists.students.find(e=>e.studentId === studentId);

    if (studentFound) {
      throw new NotFoundException(`Student with ID ${studentId} is already enrolled in course ${courseCode}`);
    }

    const data= this.prismaService.studentToCourse.create({
      data: {
        course: {
          connect: {
            id: courseExists.id,
          },
        },
        student: {
          connect: {
            id: studentExists.id,
          },
        },
      },
    });
    this.eventEmitter.emit('student.enrolled', { type: 'student.enrolled', data: {user, studentId, courseCode,} });

    return data;
  }
// eslint-disable-next-line max-statements
  public async removeStudent(
    user: User,
    courseCode: string,
    studentId: string,
  ) {
    const courseExists = await this.prismaService.course.findUnique({
      where: {
        courseCode,
      },
      include:{
        students: true,
        school: true,
      }
    });

    if (!courseExists) {
      throw new NotFoundException(`Course with code ${courseCode} not found`);
    }

    const studentExists = await this.prismaService.user.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!studentExists) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const studentFound = courseExists.students.find(e=>e.studentId === studentId);

    if (!studentFound) {
      throw new NotFoundException(`Student with ID ${studentId} is not enrolled in course ${courseCode}`);
    }

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      if (courseExists.school.districtId !== user.districtId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (
      user.role === Roles.PSA ||
      user.role === Roles.SA ||
      user.role === Roles.TEACHER
    ) {
      if (courseExists.schoolId !== user.schoolId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.STUDENT || user.role === Roles.PARENT) {
      throw new ForbiddenException('You are not authorized');
    }

    const data = this.prismaService.studentToCourse.delete({
      where:{
        id: studentFound.id
      }
    });

    this.eventEmitter.emit('student.left', { type: 'student.left', data: {user, studentId, courseCode,} });

    return data;
  }


  //To-Do

/* async findAverageCourseGrade(user, courseId) {
    const courses = this.prismaService.grade.findMany();
  }
*/

  async findCoursesOfTeacher(user, skip, limit) {
    if (user.role !== Roles.TEACHER) {
      throw new ForbiddenError('You are not allowed');
    }
     if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.course.count({
      where: {
        teacherId: user.id
      },
    });

    const data = await this.prismaService.course.findMany({
      where: {
        teacherId: user.id
      },
      include: {
        students:true,
      },
      skip,
      take:limit,
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

  async findCoursesOfStudent(user: User, skip: number, limit: number) {

    if (user.role !== Roles.STUDENT){
      throw new ForbiddenException('You are not allowed');
    }
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const courses = await this.prismaService.studentToCourse.findMany({
      where: {
        studentId: user.id
      },
    });

    const courseIds = courses.map((studentCourse) => studentCourse.courseId);

    const total = await this.prismaService.course.count({
      where: {
        id: {in:courseIds},
      },
    });

    const data = await this.prismaService.course.findMany({
      where: {
        id: {in:courseIds},
      },
      include:{
        students:true,
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
}
