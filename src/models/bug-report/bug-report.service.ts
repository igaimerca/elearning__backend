import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SendGridService } from 'src/common/services/sendgrid.service';
import { PrismaService } from '../../database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateBugReportInput } from './dto/create-bug-report.input';
import { UpdateBugReportInput } from './dto/update-bug-report.input';

@Injectable()
export class BugReportService {
  // eslint-disable-next-line no-unused-vars
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: SendGridService,
  ) {}

  async create(user: User, createBugReportInput: CreateBugReportInput) {
    const bug = this.prismaService.bugReporting.create({
      data: {
        ...createBugReportInput,
      },
    });

    await this.sendEmail({ email: user.email });

    return bug;
  }

  async findMany(skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.bugReporting.count({});
    const data = await this.prismaService.bugReporting.findMany({
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
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

  findOne(id: string) {
    return this.prismaService.bugReporting.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, updateBugReportInput: UpdateBugReportInput) {
    const bugReportExists = this.prismaService.bugReporting.findUnique({
      where: {
        id,
      },
    });

    if (!bugReportExists) {
      throw new NotFoundException(`Bug report with ID ${id} not found`);
    }

    return this.prismaService.bugReporting.update({
      where: {
        id,
      },
      data: {
        ...updateBugReportInput,
      },
    });
  }

  remove(user: User, id: string) {
    if (user.role !== 'CSA' && user.role !== 'CCSA') {
      throw new ForbiddenException(
        'You are not authorized to delete bug reports',
      );
    }

    const bugReportExists = this.prismaService.bugReporting.findUnique({
      where: {
        id,
      },
    });

    if (!bugReportExists) {
      throw new NotFoundException(`Bug report with ID ${id} not found`);
    }

    return this.prismaService.bugReporting.delete({
      where: {
        id,
      },
    });
  }

  async sendEmail({ email }: { email: string }) {
    const mail = {
      to: email,
      from: 'no-reply@gradearc.com',
      templateId: 'd-573a920c7ed240f4b73dc70f9f98d97a',
      dynamicTemplateData: {
        email,
      },
    };
    await this.emailService.send(mail);
  }
}
