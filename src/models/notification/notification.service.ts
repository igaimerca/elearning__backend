/* eslint-disable no-var */
/* eslint-disable eol-last */
/* eslint-disable max-statements */
import { NotificationType, Roles, TargetType } from '@prisma/client';
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { PrismaService } from '../../database/services/prisma.service';
import { User } from '../users/entities/user.entity';
import { ResponseStatus } from 'src/common/enums/responseStatus.enum';
import { PubSub } from 'graphql-subscriptions';
import { SendGridService } from '../../common/services/sendgrid.service';
import { CreateDailyEmailNotificationInput } from './dto/create-daily-notification.input';
@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService, private readonly emailService: SendGridService) { }
  pubSub = new PubSub();
  async create(user: User, createNotificationInput: CreateNotificationInput) {
    if (!(createNotificationInput.NotificationType || createNotificationInput.targetedUser || createNotificationInput.title || createNotificationInput.description)) {
      throw new BadRequestException('NotificationType, targetedUser, title, description are required');
    }
    if (user.role === Roles.STUDENT && createNotificationInput.NotificationType === NotificationType.ANNOUNCEMENT) {
      throw new BadRequestException('you are not allowed to make announcement');
    }
    //if notification is for a specific user
    if (createNotificationInput.targetedUser === TargetType.USER && !createNotificationInput.userId) {
      throw new BadRequestException('userId is required');
    }
    const insertIntoNotification = await this.prismaService.notification.create({
      data: {
        targetedUser: createNotificationInput.targetedUser,
        title: createNotificationInput.title,
        description: createNotificationInput.description,
        NotificationType: createNotificationInput.NotificationType,
        linkToAttachment: createNotificationInput.link || null,
        image: createNotificationInput.image || null,
        announcementId: createNotificationInput.announcementId || null,
      }
    });
    if (createNotificationInput.targetedUser === TargetType.USER) {
      //check if user exists
      const userExists = await this.prismaService.user.findFirst({
        where: {
          id: createNotificationInput.userId
        }
      });
      if (!userExists) {
        throw new BadRequestException('User does not exist');
      }
      await this.prismaService.userNotification.create({
        data: {
          userId: createNotificationInput.userId,
          notificationId: insertIntoNotification.id
        }
      });
    }
    return {
      id: insertIntoNotification.id,
      targetedUser: insertIntoNotification.targetedUser,
      title: insertIntoNotification.title,
      description: insertIntoNotification.description,
      NotificationType: insertIntoNotification.NotificationType,
      linkToAttachment: insertIntoNotification.linkToAttachment || '',
      image: insertIntoNotification.image || '',
      announcementId: insertIntoNotification.announcementId || '',
    };
  }
  async findAllUserNotification() {
    const userNotification = await this.prismaService.userNotification.findMany({
      include: {
        notification: true,
      }
    });
    const data = userNotification.map(item => {
      return {
        id: item.id,
        userId: item.userId,
        notificationId: item.notificationId,
        notificatinId: item.notification.id,
        title: item.notification.title,
        description: item.notification.description,
        NotificationType: item.notification.NotificationType,
        targetedUser: item.notification.targetedUser,
        linkToAttachment: item.notification.linkToAttachment || '',
        image: item.notification.image || '',
        announcementId: item.notification.announcementId || '',
      };
    });
    return data;
  }

  async findNotificationById(id: string) {
    //check if notification exists
    const notificationExists = await this.prismaService.userNotification.findFirst({
      where: {
        id: id
      }
    });
    if (!notificationExists) {
      throw new BadRequestException('Notification does not exist');
    }
    const userNotification = await this.prismaService.userNotification.findFirst({
      where: {
        id
      },
      include: {
        notification: true,
      }
    });
    const data = {
      id: userNotification.id,
      userId: userNotification.userId,
      notificationId: userNotification.notificationId,
      notificatinId: userNotification.notification.id,
      title: userNotification.notification.title,
      description: userNotification.notification.description,
      NotificationType: userNotification.notification.NotificationType,
      targetedUser: userNotification.notification.targetedUser,
      linkToAttachment: userNotification.notification.linkToAttachment || '',
      image: userNotification.notification.image || '',
      announcementId: userNotification.notification.announcementId || '',
    };
    return data;
  }
  //finding user notification of a specific user
  async findUserNotification(userId: string) {
    //check if user exists
    const userExists = await this.prismaService.user.findFirst({
      where: {
        id: userId
      }
    });
    if (!userExists) {
      throw new BadRequestException('User does not exist');
    }
    const userNotification = await this.prismaService.userNotification.findMany({
      where: {
        userId
      },
      include: {
        notification: true,
      }
    });
    const data = userNotification.map(item => {
      return {
        id: item.id,
        userId: item.userId,
        notificationId: item.notificationId,
        title: item.notification.title,
        description: item.notification.description,
        NotificationType: item.notification.NotificationType,
        targetedUser: item.notification.targetedUser,
        linkToAttachment: item.notification.linkToAttachment || '',
        image: item.notification.image || '',
        announcementId: item.notification.announcementId || '',
      };
    });
    return data;
  }
  update(id: number, updateNotificationInput: UpdateNotificationInput) {
    return `This action updates a #${id} notification`;
  }
  async delete(id: string) {
    //check if notification exists
    const notificationExists = await this.prismaService.notification.findFirst({
      where: {
        id: id
      }
    });
    if (!notificationExists) {
      throw new BadRequestException('Notification does not exist');
    }
    await this.prismaService.notification.delete({
      where: {
        id
      }
    });
    return {
      status: ResponseStatus.SUCCESS,
      message: 'Notification deleted successfully'
    };
  }

  //using subscription notification
  //finding missing assignments for a student and sending notification to the teacher of the course
  async missingAssignmentNotification(user: User, courseId: string) {
    //check if user exists
    const userExists = await this.prismaService.user.findFirst({
      where: {
        id: user.id
      }
    });
    if (!userExists) {
      throw new BadRequestException('User does not exist');
    }
    //check if course exists
    const courseExists = await this.prismaService.course.findFirst({
      where: {
        id: courseId
      }
    });
    if (!courseExists) {
      throw new BadRequestException('Course does not exist');
    }
    if (user.role !== Roles.TEACHER) {
      throw new BadRequestException('User is not a teacher');
    }
    //find all students who study the course
    const students = await this.prismaService.studentToCourse.findMany({
      where: {
        courseId
      },
      include: {
        course: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    //map throught students and finding total submission for current student
    const studentsWithTotalSubmission = students.map(async (item) => {
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
          submitterId: item.student.id,
          assignment: {
            courseId: {
              in: item.courseId
            }
          }
        }
      });
      const missedAssignments = totalAssignment - totalSubmission;
      if (missedAssignments > 5) {
        const notification = await this.prismaService.notification.create({
          data: {
            title: 'Missing Assignment',
            description: `${item.student.firstName} ${item.student.lastName} has ${missedAssignments} assignment(s) missing`,
            NotificationType: NotificationType.ASSIGNMENT,
            targetedUser: TargetType.TEACHER,
            courseId,
          }
        });
        await this.prismaService.userNotification.create({
          data: {
            userId: user.id,
            notificationId: notification.id
          }
        });
        return {
          id: notification.id,
          title: notification.title,
          description: notification.description,
          NotificationType: notification.NotificationType,
          targetedUser: notification.targetedUser,
          userId: user.id,
        };
      }
      return {
        id: '',
        title: '',
        description: '',
        NotificationType: '',
        targetedUser: '',
        userId: '',
      };
    });
    const data = await Promise.all(studentsWithTotalSubmission);
    return data;
  }
  //function returning assignment count of a teacher
  async assignmentCount(user: User, courseId: string) {
    //check if user exists
    const userExists = await this.prismaService.user.findFirst({
      where: {
        id: user.id
      }
    });
    if (!userExists) {
      throw new BadRequestException('User does not exist');
    }
    if (user.role !== Roles.TEACHER) {
      throw new BadRequestException('User is not a teacher');
    }
    //finding total assignment for this courseId
    const totalAssignment = await this.prismaService.assignment.count({
      where: {
        courseId: {
          in: courseId
        },
      }
    });
    //getting course name
    const course = await this.prismaService.course.findFirst({
      where: {
        id: courseId
      },
      select: {
        name: true,
      }
    });
    //insert into notification
    const notification = await this.prismaService.notification.create({
      data: {
        title: 'Assignment Count',
        description: `Inst ${user.firstName} ${user.lastName} has provided ${totalAssignment} assignment(s) in ${course.name}`,
        NotificationType: NotificationType.ASSIGNMENT,
        targetedUser: TargetType.TEACHER,
        courseId,
      }
    });
    await this.prismaService.userNotification.create({
      data: {
        userId: user.id,
        notificationId: notification.id
      }
    });
    return {
      id: notification.id,
      title: notification.title,
      description: notification.description,
      NotificationType: notification.NotificationType,
      targetedUser: notification.targetedUser,
      userId: user.id,
    };
  }
  //sending daily email
  private async sendEmail({
    updateDetails
  }: {
    updateDetails: string;
  }) {
    const mail = {
      to: await this.prismaService.user.findMany({
        select: {
          email: true
        }
      }),
      from: `${process.env.FROM_EMAIL}`,
      subject: 'Grade Arc Updates',
      templateId: 'd-a7d824659b9646d2bcdabe9bc8efe079',
      dynamicTemplateData: {
        updateDetails
      },
    };
    await this.emailService.send(mail);
  }

  public async dailyEmail(dailyEmail: CreateDailyEmailNotificationInput) {
    await this.sendEmail({
      updateDetails: dailyEmail.updateDetails
    });

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Daily email sent',
    };
  }
  //notififying students of assignment that are due within one week
  async assignmentDueNotification(user: User, createNotificationInput: CreateNotificationInput) {
    //check if user exists
    const userExists = await this.prismaService.user.findFirst({
      where: {
        id: user.id
      }
    });
    if (!userExists) {
      throw new BadRequestException('User does not exist');
    }
    //check if course exists
    const courseExists = await this.prismaService.course.findFirst({
      where: {
        id: createNotificationInput.courseId
      }
    });
    if (!courseExists) {
      throw new BadRequestException('Course does not exist');
    }
    if (user.role !== Roles.TEACHER) {
      throw new BadRequestException('User is not a teacher');
    }
    //finding if this course has any assignment with due date greater than one week
    var firstDay = new Date();
    var nextWeek = new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);
    const assignmentExists = await this.prismaService.assignment.findMany({
      where: {
        courseId: createNotificationInput.courseId,
        //TODO
        //fixing this date
         due:{
          lte:nextWeek
         }
      }
    });
    if (assignmentExists.length===0) {
      throw new BadRequestException('No assigment that is due within one week');
    }
    //finding all students who studythis course
    const students = await this.prismaService.studentToCourse.findMany({
      where: {
        courseId: createNotificationInput.courseId
      },
      include: {
        student: {
          select: {
            id: true
          }
        }
      }
    });
    //insert  into notifications
    const notification = await this.prismaService.notification.create({
      data: {
        title: createNotificationInput.title,
        description: createNotificationInput.description,
        NotificationType: createNotificationInput.NotificationType,
        targetedUser: createNotificationInput.targetedUser,
      }
    });
    //inserting into userNotification from each id of a student from students
    for (let i = 0; i < students.length; i++) {
      await this.prismaService.userNotification.create({
        data: {
          userId: students[i].studentId,
          notificationId: notification.id
        }
      });
    }
    return {
      id: notification.id,
      title: notification.title,
      description: notification.description,
      NotificationType: notification.NotificationType,
      targetedUser: notification.targetedUser
    };
  }
}