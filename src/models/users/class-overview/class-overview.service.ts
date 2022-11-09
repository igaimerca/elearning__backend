/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable max-statements */
import { PrismaService } from '../../../database/services/prisma.service';
import { User } from '../entities/user.entity';
import {
    Injectable,
    ForbiddenException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { Roles } from '@prisma/client';
@Injectable()
export class ClassOverviewService {
    constructor(private readonly prismaService: PrismaService) { }
    async studentOverview(user: User, studentId: string) {
        if (user.role !== Roles.STUDENT) {
            throw new ForbiddenException('only students can get class overview');
        }
        if (!studentId) {
            throw new BadRequestException('studentId is required');
        }
        //checking if student exist
        const studentExists = await this.prismaService.user.findUnique({
            where: {
                id: studentId
            }
        });
        //if student not exist
        if (!studentExists) {
            throw new NotFoundException('Student not found');
        }
        //getting student's courses
        const studentCourses = await this.prismaService.studentToCourse.findMany({
            where: {
                studentId: studentId
            },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        picture: true,
                        teacher: {
                            select: {
                                firstName: true,
                                lastName: true,
                            }
                        },
                    },
                }
            }
        });
        //if student has no courses
        if (!studentCourses) {
            throw new BadRequestException('Student has no courses');
        }
        //mapping studentCourse data to ClassOverview entity fields
        const classOverview = studentCourses.map(async course => {
            const assignmentCount = await this.prismaService.assignment.count({
                where: {
                    courseId: {
                        in: course.courseId
                    }
                }
            });
            //missing assignment value for this student
            const submissionCount = await this.prismaService.submission.count({
                where: {
                    submitterId: studentId,
                    assignment: {
                        courseId: {
                            in: course.courseId
                        }
                    }
                }
            });
            const missedAssignments = assignmentCount - submissionCount;
            return {
                courseId: course.courseId,
                courseName: course.course.name,
                coursePicture: course.course.picture,
                teacherName: `${course.course.teacher.firstName} ${course.course.teacher.lastName}`,
                missingAssignments: missedAssignments,
                averageGrade: '',
                classStartTime: '',
                classEndTime: '',
            };
        });
        return classOverview;
    }
}
//TODO
//1. finding average grade and adding time for class
