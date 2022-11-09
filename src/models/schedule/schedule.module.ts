import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleResolver } from './schedule.resolver';
import { PrismaService } from 'src/database/services/prisma.service';

@Module({
  providers: [ScheduleResolver, ScheduleService,PrismaService]
})
export class ScheduleModule {}
