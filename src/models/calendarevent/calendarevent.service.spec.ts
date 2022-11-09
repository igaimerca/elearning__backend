import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { CalendarEventResolver } from './calendarevent.resolver';
import { CalendarEventService } from './calendarevent.service';

describe('CalendarEventService', () => {
  let service: CalendarEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarEventResolver, CalendarEventService, PrismaService],
    }).compile();

    service = module.get<CalendarEventService>(CalendarEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
