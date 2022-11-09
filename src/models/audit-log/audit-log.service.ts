/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateAuditLogInput } from './dto/create-audit-log.input';
import { UpdateAuditLogInput } from './dto/update-audit-log.input';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/database/services/prisma.service';
import { Roles, User } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private readonly prismaService: PrismaService) { }

  @OnEvent('**')
  async handleAuditEvents(payload: any) {
    const auditLog = {} as CreateAuditLogInput;

    switch (payload.type) {
        case 'user.login':

          auditLog.userId = payload.data.id,
          auditLog.action = payload.type,
          auditLog.details = `user with ID ${payload.data.id} logged in`,

          await this.prismaService.auditLog.create({
            data: {
              ...auditLog,
            }
          });
          break;

        case 'user.logout':

          auditLog.userId = payload.data.id,
          auditLog.action = payload.type,
          auditLog.details =`user with ID ${payload.data.id} logged out`,

          await this.prismaService.auditLog.create({
            data: {
              ...auditLog,
            }
          });
        break;

        case 'student.enrolled':

          auditLog.userId = payload.data.user.id,
          auditLog.action = payload.type,
          auditLog.details = `enrolled student with ID ${payload.data.studentId} in course with course-code ${payload.data.courseCode}`,
          await this.prismaService.auditLog.create({
              data: {
                ...auditLog,
              }
            });
          break;

        case 'student.left':

          auditLog.userId = payload.data.user.id,
          auditLog.action = payload.type,
          auditLog.details = `student with ID ${payload.data.studentId} left course with course-code ${payload.data.courseCode}`,

          await this.prismaService.auditLog.create({
              data: {
                ...auditLog,
              }
            });
        break;

        case 'document.delete':
          auditLog.userId = payload.data.user.id,
          auditLog.action = payload.type,
          auditLog.details = `Document ${payload.data.file.name} deleted`,

          await this.prismaService.auditLog.create({
              data: {
                ...auditLog,
              }
          });
        break;

        default:
          console.log('No audit event found');
      }
  }
  async getAllAuditLogs(user: User) {
    if (user.role !== Roles.PDA){
      throw new ForbiddenException('You are not authorized to view this data');
    }
    return this.prismaService.auditLog.findMany({});
  }
}
