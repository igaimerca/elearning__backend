import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/services/prisma.service';
import { AttendanceService } from './attendance.service';
import { AttendanceResolver } from './attendance.resolver';

@Module({
  providers: [AttendanceResolver, AttendanceService, PrismaService],
})
export class AttendanceModule { }
