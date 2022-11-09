import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { SuggestionResolver } from './suggestion.resolver';
import { SuggestionService } from './suggestion.service';

describe('SuggestionService', () => {
  let service: SuggestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuggestionResolver, SuggestionService, PrismaService],
    }).compile();

    service = module.get<SuggestionService>(SuggestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
