/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Injectable } from '@nestjs/common';

import { Action, DetailSubjects } from '../../models/ability/ability.factory';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { Roles } from '@prisma/client';
import { PrismaService } from '../../database/services/prisma.service';

@Injectable()
export class AbilityUserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSubjectInstance(
    action: Action,
    ctx: GqlExecutionContext,
    detailSubject: DetailSubjects,
  ) {
    switch (action) {
      case Action.Create:
        return this.getInstanceForCreate(ctx, detailSubject);
      case Action.Update:
        const userInstance = await this.getInstanceForUpdate(ctx);
        return userInstance;
      case Action.Read:
      case Action.Delete:
        const user = await this.getInstanceForRead(ctx);
        return user;
      default:
        return {};
    }
  }

  getInstanceForCreate(
    ctx: GqlExecutionContext,
    detailSubject: DetailSubjects,
  ) {
    const newUser = Object.values(ctx.getArgByIndex(1))[0] as User;
    switch (detailSubject) {
      case DetailSubjects.CCSA:
        newUser.role = Roles.CCSA;
        break;
      case DetailSubjects.CSA:
        newUser.role = Roles.CSA;
        break;
      case DetailSubjects.PDA:
        newUser.role = Roles.PDA;
        break;
      case DetailSubjects.DA:
        newUser.role = Roles.DA;
        break;
      case DetailSubjects.PSA:
        newUser.role = Roles.PSA;
        break;
      case DetailSubjects.SA:
        newUser.role = Roles.SA;
        break;
      case DetailSubjects.TEACHER:
        newUser.role = Roles.TEACHER;
        break;
      case DetailSubjects.STUDENT:
        newUser.role = Roles.STUDENT;
        break;
      case DetailSubjects.PARENT:
        newUser.role = Roles.PARENT;
        break;
      default:
        break;
    }

    return newUser;
  }

  async getInstanceForUpdate(ctx: GqlExecutionContext) {
    const updateUserInput: any = Object.values(ctx.getArgByIndex(1))[0];
    const userExists = await this.prismaService.user.findUnique({
      where: { id: updateUserInput.id },
    });

    return userExists;
  }

  async getInstanceForRead(ctx: GqlExecutionContext) {
    const id: any = Object.values(ctx.getArgByIndex(1))[0];
    const userExists = await this.prismaService.user.findUnique({
      where: { id },
    });

    return userExists;
  }
}
