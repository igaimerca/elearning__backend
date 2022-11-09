/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Injectable } from '@nestjs/common';

import { Action, DetailSubjects } from '../../models/ability/ability.factory';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../database/services/prisma.service';

@Injectable()
export class AbilitySchoolService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSubjectInstance(
    action: Action,
    ctx: GqlExecutionContext,
    detailSubject: DetailSubjects,
  ) {
    switch (action) {
      case Action.Update:
        const schoolInstance = await this.getInstanceForUpdate(ctx);
        return schoolInstance;
      case Action.Read:
      case Action.Delete:
        const school = await this.getInstanceForRead(ctx, detailSubject);
        return school;
      default:
        return {};
    }
  }

  async getInstanceForUpdate(ctx: GqlExecutionContext) {
    const updateSchoolInput: any = Object.values(ctx.getArgByIndex(1))[0];
    const schoolExists = await this.prismaService.school.findUnique({
      where: { id: updateSchoolInput.id },
    });

    return schoolExists;
  }

  async getInstanceForRead(
    ctx: GqlExecutionContext,
    detailSubject: DetailSubjects,
  ) {
    const id: any = Object.values(ctx.getArgByIndex(1))[0];
    if (detailSubject === DetailSubjects.ALL) {
      return {};
    }

    if (detailSubject === DetailSubjects.DISTRICT) {
      const school = { districtId: id };
      return school;
    }

    const schoolExists = await this.prismaService.school.findUnique({
      where: { id },
    });

    return schoolExists;
  }
}
