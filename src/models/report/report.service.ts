/* eslint-disable no-unused-vars */
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReadStatus } from '@prisma/client';

import { PrismaService } from '../../database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateReportInput } from './dto/create-report.input';
import { UpdateReportInput } from './dto/update-report.input';

@Injectable()
export class ReportService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.report.count({});
    const data = await this.prismaService.report.findMany({
      skip,
      take: limit,
      include: {
        reporter: true,
        reportAdminReads: {
          where: {
            adminId: user.id,
          },
          select: {
            status: true,
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

  async findOne(user: User, id: string) {
    const report = await this.prismaService.report.findUnique({
      where: { id },
      include: {
        reporter: true,
        reportAdminReads: {
          where: {
            adminId: user.id,
          },
          select: {
            status: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report does not exist');
    }

    return report;
  }

  create(user: User, createReportInput: CreateReportInput) {
    return this.prismaService.report.create({
      data: {
        ...createReportInput,
        reporterId: user.id,
      },
    });
  }

  async update(id: string, updateReportInput: UpdateReportInput) {
    const reportExists = await this.prismaService.report.findUnique({
      where: { id },
    });

    if (!reportExists) {
      throw new NotFoundException('Report does not exist');
    }

    return this.prismaService.report.update({
      where: { id },
      data: {
        ...updateReportInput,
      },
    });
  }

  remove(id: string) {
    return this.prismaService.report.delete({ where: { id } });
  }

  async setAdminReadStatus(user: User, id: string, status: ReadStatus) {
    const reportExists = await this.prismaService.report.findUnique({
      where: { id },
    });

    if (!reportExists) {
      throw new NotFoundException('Report does not exist');
    }

    const adminHasRead = await this.prismaService.reportAdminRead.findFirst({
      where: {
        reportId: id,
        adminId: user.id,
      },
    });

    if (!adminHasRead) {
      await this.prismaService.reportAdminRead.create({
        data: {
          reportId: id,
          adminId: user.id,
        },
      });
      return true;
    }

    await this.prismaService.reportAdminRead.update({
      where: {
        id: adminHasRead.id,
      },
      data: {
        status,
      },
    });

    return true;
  }

  async checkIfAdminHasReadReport(user: User, id: string) {
    const adminHasRead = await this.prismaService.reportAdminRead.findFirst({
      where: {
        reportId: id,
        adminId: user.id,
        status: 'READ',
      },
    });

    if (adminHasRead) {
      return true;
    }
    return false;
  }
}
