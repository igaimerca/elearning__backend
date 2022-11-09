import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { KnowledgeBaseService } from './knowledge-base.service';

describe('KnowledgeBaseService', () => {
  let service: KnowledgeBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeBaseService, PrismaService],
    }).compile();

    service = module.get<KnowledgeBaseService>(KnowledgeBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
