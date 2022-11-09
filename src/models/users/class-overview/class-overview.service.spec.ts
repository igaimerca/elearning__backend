import { Test, TestingModule } from '@nestjs/testing';
import { ClassOverviewService } from './class-overview.service';

describe('ClassOverviewService', () => {
  let service: ClassOverviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassOverviewService],
    }).compile();

    service = module.get<ClassOverviewService>(ClassOverviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
