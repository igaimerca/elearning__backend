import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { QuickInfoResolver } from './quick-info.resolver';
import { QuickInfoService } from './quick-info.service';

describe('QuickInfoResolver', () => {
  let resolver: QuickInfoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuickInfoResolver, QuickInfoService, PrismaService],
    }).compile();

    resolver = module.get<QuickInfoResolver>(QuickInfoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
