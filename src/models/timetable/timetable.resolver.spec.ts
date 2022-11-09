import { Test, TestingModule } from '@nestjs/testing';
import { TimetableResolver } from './timetable.resolver';
import { TimetableService } from './timetable.service';

describe('TimetableResolver', () => {
  let resolver: TimetableResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimetableResolver, TimetableService],
    }).compile();

    resolver = module.get<TimetableResolver>(TimetableResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
