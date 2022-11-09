import { Module } from '@nestjs/common';
import { ClassOverviewService } from './class-overview.service';
import { ClassOverviewResolver } from './class-overview.resolver';
import { PrismaService } from '../../../database/services/prisma.service';

@Module({
  providers: [ClassOverviewResolver, ClassOverviewService, PrismaService]
})
export class ClassOverviewModule { }
