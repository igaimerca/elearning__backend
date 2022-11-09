/* eslint-disable max-statements */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateSubmissionInput } from './dto/create-submission.input';
import { UpdateSubmissionInput } from './dto/update-submission.input';
import { PrismaService } from '../../database/services/prisma.service';
import { User } from '../users/entities/user.entity';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { Roles } from '@prisma/client';
import * as Prisma from '@prisma/client';
import * as FormData from 'form-data';
import { FileUploadService } from '../../fileUpload/fileUpload.service';
import { FileType } from '../../common/enums/fileType.enum';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { SubmissionGrades } from './entities/submission-grades.entity';

@Injectable()
export class SubmissionService {

  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly prismaService: PrismaService,
    // eslint-disable-next-line no-unused-vars
    private readonly fileUploadService: FileUploadService,
  ) { }

  async addAttachments(
    userId: string,
    submission: {
      id: string;
      assignment: {
        id: string;
        courseId: string;
      };
    },
    input: { attachments?: GraphQLUpload[] },
    token: string,
  ): Promise<Prisma.SubmissionAttachment[]> {
    const filenames: string[] = [];

    const formData = new FormData();
    formData.append(
      'path',
      await this.fileUploadService.getDynamicFilePath(
        FileType.CourseAssignmentFile,
        userId,
        `${submission.assignment.courseId}/Assignments/${submission.assignment.id}/Submissions/${submission.id}`,
      ),
    );

    for (const file of input.attachments) {
      const { createReadStream, mimetype, filename } = await file;

      formData.append('files', createReadStream(), {
        filename,
        contentType: mimetype,
      });

      formData.append('public', 'false');
      filenames.push(filename);
    }

    const { urls } = await this.fileUploadService.upload(formData, token, true);

    const attachments = [];
    for (const url of urls) {
      attachments.push({
        linkToAttachment: url,
        attachmentName: filenames.shift(),
        submissionId: submission.id,
      });
    }

    await this.prismaService.submissionAttachment.createMany({
      data: attachments,
    });

    return attachments;
  }

  async removeAttachments(
    attachments: Prisma.SubmissionAttachment[],
    token: string,
  ) {
    const deleteMultiple = attachments.length > 1;
    const paths = deleteMultiple
      ? attachments.map((attachment) => {
        return attachment.linkToAttachment.split(
          process.env.FILE_API_CDN_URL + '/',
        )[1];
      })
      : [attachments[0].linkToAttachment];

    await this.fileUploadService.delete(
      paths.join('&paths='),
      token,
      deleteMultiple,
    );
  }

  // eslint-disable-next-line no-unused-vars
  async create(
    user: User,
    createSubmissionInput: CreateSubmissionInput,
    token: string,
  ) {
    const assignmentExists = await this.prismaService.assignment.findUnique({
      where: { id: createSubmissionInput.assignmentId },
    });
    if (!assignmentExists) {
      throw new BadRequestException('Assignment does not exist');
    }
    const courseIds = user.studentCourses.map(
      (studentCourse) => studentCourse.courseId,
    );

    if (!courseIds.includes(assignmentExists.courseId)) {
      throw new ForbiddenException('You are not allowed');
    }

    const submission = await this.prismaService.submission.create({
      data: {
        note: createSubmissionInput.note,
        assignmentId: createSubmissionInput.assignmentId,
        submitterId: user.id,
        comment: '',
      },
      include: {
        assignment: true,
        submissionAttachments: true,
      },
    });

    if (createSubmissionInput.attachments.length) {
      submission.submissionAttachments = await this.addAttachments(
        user.id,
        submission,
        createSubmissionInput,
        token,
      );
    }
    return submission;
  }

  async findAll(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.submission.count({
      where: {
        submitterId: user.id,
      },
    });
    const submissions = await this.prismaService.submission.findMany({
      where: {
        submitterId: user.id,
      },
      skip,
      take: limit,
      include: {
        submitter: true,
        submissionAttachments: true,
      },
    });

    return {
      data: submissions,
      pageInfo: {
        total,
        skip,
        limit,
      },
    };
  }

  async findOne(user: User, id: string) {
    const submissionExists = await this.prismaService.submission.findUnique({
      where: {
        id,
      },
      include: {
        submitter: true,
        submissionAttachments: true,
      },
    });

    if (user.role === Roles.PDA || user.role === Roles.DA) {
      if (submissionExists.submitter.districtId !== user.districtId) {
        throw new ForbiddenException('You are not allowed');
      }
    } else if (user.role === Roles.PSA || user.role === Roles.SA) {
      if (submissionExists.submitter.schoolId !== user.schoolId) {
        throw new ForbiddenException('You are not allowed');
      }
    } else if (user.role === Roles.TEACHER) {
      const assignment = await this.prismaService.assignment.findUnique({
        where: { id: submissionExists.assignmentId },
        include: {
          course: true,
        },
      });
      if (assignment.course.teacherId !== user.id) {
        throw new ForbiddenException('You are not allowed');
      }
    } else if (user.role === Roles.STUDENT) {
      if (submissionExists.submitterId !== user.id) {
        throw new ForbiddenException('You are not allowed');
      }
    } else if (user.role === Roles.PARENT) {
      const childIds = user.children.map((childParent) => childParent.childId);
      if (!childIds.includes(submissionExists.submitterId)) {
        throw new ForbiddenException('You are not allowed');
      }
    }

    return submissionExists;
  }

  async findAssignmentSubmissions(
    user: User,
    assignmentId: string,
    skip: number,
    limit: number,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const assignment = await this.prismaService.assignment.findUnique({
      where: { id: assignmentId },
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
      if (assignment.course.school.districtId !== user.districtId) {
        throw new ForbiddenException('You are not allowed');
      }
    } else if (user.role === Roles.PSA || user.role === Roles.SA) {
      if (assignment.course.schoolId !== user.schoolId) {
        throw new ForbiddenException('You are not allowed');
      }
    } else if (user.role === Roles.TEACHER) {
      if (assignment.course.teacherId !== user.id) {
        throw new ForbiddenException('You are not allowed');
      }
    } else if (user.role === Roles.STUDENT) {
      const courseIds = user.studentCourses.map(
        (studentCourse) => studentCourse.courseId,
      );
      if (!courseIds.includes(assignment.courseId)) {
        throw new ForbiddenException('You are not allowed');
      }
    } else if (user.role === Roles.PARENT) {
      const childIds = user.children.map((childParent) => childParent.childId);
      const studentIds = assignment.course.students.map(
        (studentCourse) => studentCourse.studentId,
      );
      const bothIds = childIds.filter((id) => studentIds.includes(id));
      if (bothIds.length === 0) {
        throw new ForbiddenException('You are not allowed');
      }
    }

    const total = await this.prismaService.submission.count({
      where: {
        assignmentId,
      },
    });

    const submissions = await this.prismaService.submission.findMany({
      where: {
        assignmentId,
      },
      include: {
        submitter: true,
        submissionAttachments: true,
      },
    });

    return {
      data: submissions,
      pageInfo: {
        total,
        skip,
        limit,
      },
    };
  }

  async update(
    user: User,
    id: string,
    data: UpdateSubmissionInput,
    token: string,
  ) {
    const submissionExists = await this.prismaService.submission.findUnique({
      where: {
        id,
      },
    });

    if (submissionExists.submitterId !== user.id) {
      throw new ForbiddenException('You are not allowed');
    }

    const updateData = {
      ...data,
      attachments: undefined,
      attachmentsToDelete: undefined,
    };

    const submission = await this.prismaService.submission.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        assignment: true,
        submissionAttachments: true,
      },
    });
    if (data.attachmentsToDelete?.length) {
      const ids = [];
      for (const attachment of data.attachmentsToDelete) {
        if (
          submission.submissionAttachments.find((a) => a.id === attachment.id)
        ) {
          ids.push(attachment.id);
        }
      }
      if (ids.length) {
        await this.prismaService.submissionAttachment.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        });
        await this.removeAttachments(
          submission.submissionAttachments.filter((x) => ids.includes(x.id)),
          token,
        );
        submission.submissionAttachments = submission.submissionAttachments.filter(
          (x) => !ids.includes(x.id),
        );
      }
    }
    if (data.attachments?.length) {
      submission.submissionAttachments = [
        ...submission.submissionAttachments,
        ...(await this.addAttachments(user.id, submission, data, token)),
      ];
    }
    return submission;
  }

  async addComment(user: User, id: string, comment: string) {
    const submissionExists = await this.prismaService.submission.findUnique({
      where: {
        id,
      },
    });

    if (!submissionExists) {
      throw new BadRequestException('Assignment does not exist');
    }

    if (user.role !== 'TEACHER') {
      throw new BadRequestException('You are not authorized to add a comment');
    }

    const assignment = await this.prismaService.assignment.findUnique({
      where: { id: submissionExists.assignmentId },
      include: {
        course: true,
      },
    });
    if (assignment.course.teacherId !== user.id) {
      throw new ForbiddenException('You are not allowed');
    }

    return this.prismaService.submission.update({
      data: {
        comment,
      },
      where: {
        id,
      },
    });
  }

  async remove(user: User, id: string, token: string) {
    const submissionExists = await this.prismaService.submission.findUnique({
      where: {
        id,
      },
      include: {
        submissionAttachments: true,
      },
    });
    if (!submissionExists) {
      throw new BadRequestException('Assignment does not exist');
    }
    if (submissionExists.submitterId !== user.id) {
      throw new ForbiddenException('You are not allowed');
    }

    const data = await this.prismaService.submission.delete({
      where: {
        id,
      },
    });
    if (submissionExists.submissionAttachments.length > 0) {
      await this.removeAttachments(
        submissionExists.submissionAttachments,
        token,
      );
    }
    return data;
  }

  async findWeeklySubmissionsBySchool(user: User, schoolId: string) {
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

    const result = new Array(7).fill({}).map((_, i) => {
      return { day: i, totalAssignmentSubmissions: 0 };
    });

    const date = new Date();
    date.setDate(date.getDate() - (date.getDay() + 1));

    const firstDay = new Date(date);
    date.setDate(date.getDate() + 8);

    const lastDay = new Date(date);

    const data = await this.prismaService.submission.groupBy({
      where: {
        submitter: { schoolId },
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      by: ['createdAt'],
      _count: {
        _all: true,
      },
    });

    data.forEach((item) => {
      const day = new Date(item.createdAt).getDay();
      result[day].totalAssignmentSubmissions += item._count._all;
    });

    return result;
  }

  async findWeeklyAssignmentSubmissionsByStudent(user) {
    if (user.role !== Roles.STUDENT) {
      throw new ForbiddenException('You are not allowed');
    }
    const result = new Array(7).fill({}).map((_, i) => {
      return { day: i, totalAssignmentSubmissions: 0 };
    });

    const date = new Date();
    date.setDate(date.getDate() - (date.getDay() + 1));

    const firstDay = new Date(date);
    date.setDate(date.getDate() + 8);

    const lastDay = new Date(date);

    const data = await this.prismaService.submission.groupBy({
      where: {
        submitterId: user.id,
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      by: ['createdAt'],
      _count: {
        _all: true,
      },
    });

    data.forEach((item) => {
      const day = new Date(item.createdAt).getDay();
      result[day].totalAssignmentSubmissions += item._count._all;
    });

    return result;
  }


  async findSubmissionsByCourse(user: User, courseId: string): Promise<SubmissionGrades[]> {

    if (user.role !== Roles.TEACHER) {
      throw new ForbiddenException('You are not allowed');
    }



    const courseExists = await this.prismaService.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!courseExists) {
      throw new NotFoundException('Course does not exist');
    }


    const grades = await this.prismaService.grade.findMany({
      where: {
        courseId,
      },
      include: {
        tests: true,
        user: true,
      }
    });


    return grades.map(grade => {
      return {
        id: grade.id,
        firstName: grade.user.firstName,
        lastName: grade.user.lastName,
        profilePicture: grade.user.profilePicture,
        marks: grade.percentage,
        grade: this.calculateGrade(grade.percentage),
      };
    });
  }


  calculateGrade(marks: number): string {
    let grade;

    if (marks > 93) {
      grade = 'A+';
    } else if (marks > 90) {
      grade = 'A';
    } else if (marks > 87) {
      grade = 'A-';
    } else if (marks > 83) {
      grade = 'B+';
    } else if (marks > 80) {
      grade = 'B';
    } else if (marks > 77) {
      grade = 'B-';
    } else if (marks > 73) {
      grade = 'C+';
    } else if (marks > 70) {
      grade = 'C';
    } else if (marks > 67) {
      grade = 'C-';
    } else if (marks > 63) {
      grade = 'D+';
    } else if (marks > 60) {
      grade = 'D';
    } else if (marks > 57) {
      grade = 'D-';
    } else {
      grade = 'F';
    }


    return grade;
  }

}


