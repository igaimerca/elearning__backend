import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableResolver } from './timetable.resolver';

@Module({
  providers: [TimetableResolver, TimetableService],
})
export class TimetableModule {}
