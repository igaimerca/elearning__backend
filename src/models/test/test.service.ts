import { Injectable } from '@nestjs/common';
import { Roles, User } from '@prisma/client';
import { ForbiddenError } from 'apollo-server-express';
import { PrismaService } from 'src/database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from 'src/utils/constants';
import { CreateTestInput } from './dto/create-test.input';

@Injectable()
export class TestService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createTestInput: CreateTestInput) {
    const test = await this.prismaService.test.create({
      data: {
        courseId: createTestInput.courseId,
        title: createTestInput.title,
        description: createTestInput.description,
        due: createTestInput.due,
        open: createTestInput.open,
        limit: createTestInput.limit,
        allowReviewPreviousTest: createTestInput.allowReviewPreviousTest,
        gradeId: null,
      },
      include: {
        course: true,
        TestQuestions: true,
      },
    });

    await this.prismaService.testQuestions.createMany({
      data: createTestInput.questions.map((question) => ({
        ...question,
        testId: test.id,
      })),
    });

    return test;
  }

  async findByCourse(courseId:string) {
    const data = await this.prismaService.test.findMany({
      where:{
        courseId
      },
      include: {
        TestQuestions: true,
        course: {
          include: {
            students: {
              include: {
                student: true,
              },
            },
          },
        },
      },
    });

    const students: User[] = [];
    data.forEach((test) =>
      test.course.students.forEach((student) => {
        students.push(student.student);
      }),
    );

    return data.map((test) => {
      return {
        ...test,
        students: test.course.students.map((student) => student.student),
      };
    });
  }

  async findByTeacher(user: User, skip: number, limit: number) {

    if (user.role !== Roles.TEACHER) {
      throw new ForbiddenError('You are not allowed');
    }
     if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const courses = await this.prismaService.course.findMany({
      where:{
        teacherId: user.id,
      },
    });
    const courseIds = courses.map((course) => course.id);

    const total = await this.prismaService.test.count({
      where: {
        courseId: {in:courseIds}
      },
    });

    const data = await this.prismaService.test.findMany({
      where: {
        courseId: {in:courseIds}
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
}
