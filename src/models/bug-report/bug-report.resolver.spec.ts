import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { BugReportResolver } from './bug-report.resolver';
import { BugReportService } from './bug-report.service';

describe('BugReportResolver', () => {
  let resolver: BugReportResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BugReportResolver, BugReportService, PrismaService],
    }).compile();

    resolver = module.get<BugReportResolver>(BugReportResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
