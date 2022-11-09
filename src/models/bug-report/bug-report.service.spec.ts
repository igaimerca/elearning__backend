import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { BugReportResolver } from './bug-report.resolver';
import { BugReportService } from './bug-report.service';

describe('BugReportService', () => {
  let service: BugReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BugReportResolver, BugReportService, PrismaService],
    }).compile();

    service = module.get<BugReportService>(BugReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
