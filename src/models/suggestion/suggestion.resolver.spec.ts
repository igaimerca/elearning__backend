import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { SuggestionResolver } from './suggestion.resolver';
import { SuggestionService } from './suggestion.service';

describe('SuggestionResolver', () => {
  let resolver: SuggestionResolver;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuggestionResolver, SuggestionService, PrismaService],
    }).compile();

    resolver = module.get<SuggestionResolver>(SuggestionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
