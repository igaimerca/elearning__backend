import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { CalendarEventResolver } from './calendarevent.resolver';
import { CalendarEventService } from './calendarevent.service';

describe('CalendarEventResolver', () => {
  let resolver: CalendarEventResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarEventResolver, CalendarEventService, PrismaService],
    }).compile();

    resolver = module.get<CalendarEventResolver>(CalendarEventResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
