import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { QuickInfoResolver } from './quick-info.resolver';
import { QuickInfoService } from './quick-info.service';

describe('QuickInfoService', () => {
  let service: QuickInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuickInfoResolver, QuickInfoService, PrismaService],
    }).compile();

    service = module.get<QuickInfoService>(QuickInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
