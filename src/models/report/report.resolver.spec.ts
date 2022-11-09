import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { ReportResolver } from './report.resolver';
import { ReportService } from './report.service';

describe('ReportResolver', () => {
  let resolver: ReportResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportResolver, ReportService, PrismaService],
    }).compile();

    resolver = module.get<ReportResolver>(ReportResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
