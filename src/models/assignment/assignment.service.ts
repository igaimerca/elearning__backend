/* eslint-disable max-len */
/* eslint-disable max-statements */
/* eslint-disable max-depth */
import {
  BadRequestException,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { PrismaService } from '../../database/services/prisma.service';
import { User } from '../users/entities/user.entity';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment.input';
import { Roles } from '@prisma/client';
import { Submission } from '../submission/entities/submission.entity';

@Injectable()
export class AssignmentService {

  // eslint-disable-next-line no-unused-vars
  constructor(private readonly prismaService: PrismaService) {}

  create(user: User, createAssignmentInput: CreateAssignmentInput) {
    return this.prismaService.assignment.create({
      data: {
        title: createAssignmentInput.title,
        description: createAssignmentInput.description,
        due: createAssignmentInput.due,
        marks: createAssignmentInput.marks,
        courseId: createAssignmentInput.courseId,
        userId: user.id,
        visible: createAssignmentInput.visible,
      },
    });
  }

  async findOne(user: User, id: string) {
    const assignmentExists = await this.prismaService.assignment.findUnique({
      where: {
        id,
      },
      include: {
        course: {
          include: {
            school: true,
            students: true,
          },
        },
      },
    });

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      if (assignmentExists.course.school.districtId !== user.districtId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.PSA || user.role === Roles.SA) {
      if (assignmentExists.course.schoolId !== user.schoolId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.TEACHER) {
      if (assignmentExists.course.teacherId !== user.id) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.STUDENT) {
      const studentIds = assignmentExists.course.students.map((studentToCourse) => studentToCourse.studentId);
      if (!studentIds.includes(user.id)) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.PARENT) {
      const relations = await this.prismaService.parentChild.findMany({
        where: {
          parentId: user.id,
        },
      });
      const childIds = relations.map((ele) => ele.childId);
      const studentIds = assignmentExists.course.students.map((studentToCourse) => studentToCourse.studentId);
      const childStudentIds = childIds.filter((childId) => studentIds.includes(childId));
      if (childStudentIds.length === 0) {
        throw new ForbiddenException('You are not authorized');
      }
    }

    return assignmentExists;
  }

  async update(user: User, id: string, updateAssignmentInput: UpdateAssignmentInput) {
    const assignmentExists = await this.prismaService.assignment.findUnique({
      where: {
        id,
      },
      include: {
        course: {
          include: {
            school: true,
            students: true,
          },
        },
      },
    });

    if (!assignmentExists) {
      throw new BadRequestException('Assignment does not exist');
    }

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      if (assignmentExists.course.school.districtId !== user.districtId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.PSA || user.role === Roles.SA) {
      if (assignmentExists.course.schoolId !== user.schoolId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.TEACHER) {
      if (assignmentExists.course.teacherId !== user.id) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.STUDENT || user.role === Roles.PARENT) {
      throw new ForbiddenException('You are not authorized');
    }

    return this.prismaService.assignment.update({
      where: {
        id,
      },
      data: {
        title: updateAssignmentInput.title,
        description: updateAssignmentInput.description,
        due: updateAssignmentInput.due,
        marks: updateAssignmentInput.marks,
        visible: updateAssignmentInput.visible,
        folderPath: updateAssignmentInput.folderPath,
        courseId: updateAssignmentInput.courseId,
      },
    });
  }

  async attachFolder(user: User, id: string, folderPath: string) {
    const assignmentExists = await this.prismaService.assignment.findUnique({
      where: {
        id,
      }
    });

    if (!assignmentExists) {
      throw new BadRequestException('Assignment does not exist');
    }

    if (assignmentExists.userId !== user.id) {
      throw new ForbiddenException('You are not authorized');
    }

    const folderExists = await this.prismaService.folder.findUnique({
      where: {
        id: folderPath,
      }
    });

    if (!folderExists) {
      throw new BadRequestException('Folder does not exist');
    }

    return this.prismaService.assignment.update({
      where: {
        id,
      },
      data: {
        folderPath,
      },
    });
  }

  async remove(user: User, id: string) {
    const assignmentExists = await this.prismaService.assignment.findUnique({
      where: {
        id,
      },
      include: {
        course: {
          include: {
            school: true,
            students: true,
          },
        },
      },
    });

    if (!assignmentExists) {
      throw new BadRequestException('Assignment does not exist');
    }

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      if (assignmentExists.course.school.districtId !== user.districtId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.PSA || user.role === Roles.SA) {
      if (assignmentExists.course.schoolId !== user.schoolId) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.TEACHER) {
      if (assignmentExists.course.teacherId !== user.id) {
        throw new ForbiddenException('You are not authorized');
      }
    } else if (user.role === Roles.STUDENT || user.role === Roles.PARENT) {
      throw new ForbiddenException('You are not authorized');
    }

    return this.prismaService.assignment.delete({
      where: {
        id,
      },
    });
  }

  async getParentCompletedAssignment(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const relations = await this.prismaService.parentChild.findMany({
      where: {
        parentId: user.id,
      },
    });
    const childIds = relations.map((ele) => ele.childId);

    const total = await this.prismaService.submission.count({
      where: {
        submitterId: { in: childIds },
      },
    });

    const data = await this.prismaService.submission.findMany({
      where: {
        submitterId: { in: childIds },
      },
      include: {
        assignment: true,
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

  async getParentTodoAssignment(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const relations = await this.prismaService.parentChild.findMany({
      where: {
        parentId: user.id,
      },
    });

    let childCourseIds = [];
    // The array of assignment ids that every children submitted
    let submittedAssignmentIds = [];
    for (const relation of relations) {
      const child = await this.prismaService.user.findUnique({
        where: {
          id: relation.childId,
        },
        include: {
          studentCourses: true,
        },
      });
      const currentCourseIds = child.studentCourses.map((studentCourse) => {
        return studentCourse.courseId;
      });
      childCourseIds = [...childCourseIds, ...currentCourseIds];

      const childSubmissions = await this.prismaService.submission.findMany({
        where: {
          submitterId: relation.childId,
        },
      });
      const assignmentIds = childSubmissions.map((ele) => ele.assignmentId);

      if (submittedAssignmentIds.length === 0) {
        submittedAssignmentIds = [...assignmentIds];
      } else {
        submittedAssignmentIds = assignmentIds.filter((ele) =>
          submittedAssignmentIds.includes(ele),
        );
      }
    }

    const total = await this.prismaService.assignment.count({
      where: {
        courseId: { in: childCourseIds },
        due: { gte: new Date() },
        visible: true,
        id: { notIn: submittedAssignmentIds },
      },
    });

    const data = await this.prismaService.assignment.findMany({
      where: {
        courseId: { in: childCourseIds },
        due: { gte: new Date() },
        visible: true,
        id: { notIn: submittedAssignmentIds },
      },
      include: {
        submissions: true,
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

  async getParentOverDueAssignment(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const relations = await this.prismaService.parentChild.findMany({
      where: {
        parentId: user.id,
      },
    });

    let childCourseIds = [];
    // The array of assignment ids that every children submitted
    let submittedAssignmentIds = [];
    for (const relation of relations) {
      const child = await this.prismaService.user.findUnique({
        where: {
          id: relation.childId,
        },
        include: {
          studentCourses: true,
        },
      });

      const currentCourseIds = child.studentCourses.map((studentCourse) => {
        return studentCourse.courseId;
      });
      childCourseIds = [...childCourseIds, ...currentCourseIds];

      const childSubmissions = await this.prismaService.submission.findMany({
        where: {
          submitterId: relation.childId,
        },
      });
      const assignmentIds = childSubmissions.map((ele) => ele.assignmentId);

      if (submittedAssignmentIds.length === 0) {
        submittedAssignmentIds = [...assignmentIds];
      } else {
        submittedAssignmentIds = assignmentIds.filter((ele) =>
          submittedAssignmentIds.includes(ele),
        );
      }
    }

    const total = await this.prismaService.assignment.count({
      where: {
        courseId: { in: childCourseIds },
        due: { lt: new Date() },
        visible: true,
        id: { notIn: submittedAssignmentIds },
      },
    });

    const data = await this.prismaService.assignment.findMany({
      where: {
        courseId: { in: childCourseIds },
        due: { lt: new Date() },
        visible: true,
        id: { notIn: submittedAssignmentIds },
      },
      include: {
        submissions: true,
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

  async getStudentTodoAssignment(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const child = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        studentCourses: true,
      },
    });
    const courseIds = child.studentCourses.map((studentCourse) => studentCourse.courseId);

    const total = await this.prismaService.assignment.count({
      where: {
        courseId: { in: courseIds },
        due: { gte: new Date() },
        visible: true,
        submissions: {
          none: {
            submitterId: user.id,
          },
        },
      },
    });

    const data = await this.prismaService.assignment.findMany({
      where: {
        courseId: { in: courseIds },
        due: { gte: new Date() },
        visible: true,
        submissions: {
          none: {
            submitterId: user.id,
          },
        },
      },
      include: {
        submissions: true,
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

  async getStudentCompletedAssignments(
    user: User,
    skip: number,
    limit: number,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const total = await this.prismaService.assignment.count({
      where: {
        submissions: {
          some: {
            submitterId: user.id,
          },
        },
      },
    });
    const data = await this.prismaService.assignment.findMany({
      skip,
      take: limit,
      where: {
        submissions: {
          some: {
            submitterId: user.id,
          },
        },
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

  async getStudentOverDueAssignment(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const child = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        studentCourses: true,
      },
    });
    const courseIds = child.studentCourses.map((studentCourse) => studentCourse.courseId);

    const total = await this.prismaService.assignment.count({
      where: {
        courseId: { in: courseIds },
        due: { lt: new Date() },
        visible: true,
        submissions: {
          none: {
            submitterId: user.id,
          },
        },
      },
    });

    const data = await this.prismaService.assignment.findMany({
      where: {
        courseId: { in: courseIds },
        due: { lt: new Date() },
        visible: true,
        submissions: {
          none: {
            submitterId: user.id,
          },
        },
      },
      include: {
        submissions: true,
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

  async getAssignmentCompletionByCourse(user: User, courseId: string) {

    if (user.role !== Roles.STUDENT) {
      throw new ForbiddenException('Only student can get assignment completion');
    }

    const child = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        studentCourses: {
          where: {
            courseId: courseId,
          },
        }
      },
    });

    const id=child.studentCourses[0].courseId;

    const total = await this.prismaService.assignment.findMany({
      where: {
        courseId: id,
        visible: true,
      },
    });

    const assignmentIds=total.map((assignment=>assignment.id));

    const submissions = await this.prismaService.submission.findMany({
      where: {
        submitterId: user.id,
        assignmentId: { in: assignmentIds }
      },
    });

    return {
      Completed: submissions.length,
      Incomplete:total.length-submissions.length
    };
  }

  async getAssignmentsByTeacher(user: User, skip: number, limit: number) {
    if (user.role !== Roles.TEACHER) {
      throw new ForbiddenException('You are not alowed');
    }

    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.assignment.count({
      where: {
        userId:user.id
      },
    });

    const data = await this.prismaService.assignment.findMany({
      where: {
        userId:user.id
      },
      include:{
        submissions:true
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

  async getStudentAssignmentCompletion(user: User) {

    if (user.role !== Roles.STUDENT) {
      throw new ForbiddenException('Only student can get assignment completion');
    }

    const child = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        studentCourses:true,
      },
    });

    const ids = child.studentCourses.map((studentCourse) => studentCourse.courseId);

     const total = await this.prismaService.assignment.findMany({
      where: {
        courseId:{in:ids},
        visible: true,
      },
    });

    const assignmentIds=total.map((assignment=>assignment.id));

    const submissions = await this.prismaService.submission.findMany({
      where: {
        submitterId: user.id,
        assignmentId: { in: assignmentIds }
      },
    });

    return {
      Completed: submissions.length,
      Incomplete:total.length-submissions.length
    };
  }

  async getStudentAssignments(user: User, skip: number, limit: number) {

    if (user.role !== Roles.STUDENT) {
      throw new ForbiddenException('You are not alowed');
    }

    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const child = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        studentCourses:true,
      },
    });

    const ids = child.studentCourses.map((studentCourse) => studentCourse.courseId);

    const total = await this.prismaService.assignment.count({
      where: {
        courseId:{in:ids},
        visible: true,
      },
    });

    const data = await this.prismaService.assignment.findMany({
      skip,
      take : limit,
      where: {
        courseId:{in:ids},
        visible: true,
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

  async getMonthlySchoolAssignments(user: User) {
    if (user.role !== Roles.SA) {
      throw new ForbiddenException('You are not alowed');
    };

    const firstDay = new Date(new Date().getFullYear() - 1, 11, 31);
    const lastDay = new Date(new Date().getFullYear() + 1, 0, 1);

    const result = new Array(12).fill({}).map((_, i) => {
      return { month: i, assignments: 0 };
    });

    const school = await this.prismaService.school.findUnique({
      where: {
        id: user.schoolId,
      },
      include: {
        courses: true,
      }
    });

    const courseIds = school.courses.map((course) => course.id);

    const assignment = await this.prismaService.assignment.groupBy({
      where: {
        courseId: { in: courseIds },
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      by: ['createdAt'],
      _count: {
        _all: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    assignment.forEach((item) => {
      const month = new Date(item.createdAt).getMonth();
      result[month].assignments += item._count._all;
    });

    return result;
  }
}
