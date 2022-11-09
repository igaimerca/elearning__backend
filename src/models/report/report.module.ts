import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { ReportResolver } from './report.resolver';
import { ReportService } from './report.service';

@Module({
  providers: [ReportResolver, ReportService, PrismaService],
})
export class ReportModule {}
