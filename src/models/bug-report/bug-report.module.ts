import { Module } from '@nestjs/common';
import { SendGridService } from 'src/common/services/sendgrid.service';
import { PrismaService } from '../../database/services/prisma.service';
import { BugReportResolver } from './bug-report.resolver';
import { BugReportService } from './bug-report.service';

@Module({
  providers: [
    BugReportResolver,
    BugReportService,
    PrismaService,
    SendGridService,
  ],
})
export class BugReportModule {}
