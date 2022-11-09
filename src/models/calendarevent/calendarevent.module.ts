import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { CalendarEventResolver } from './calendarevent.resolver';
import { CalendarEventService } from './calendarevent.service';

@Module({
  providers: [CalendarEventResolver, CalendarEventService, PrismaService],
})
export class CalendarEventModule {}
