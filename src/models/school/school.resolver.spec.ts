import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { SchoolResolver } from './school.resolver';
import { SchoolService } from './school.service';

describe('SchoolResolver', () => {
  let resolver: SchoolResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolResolver, SchoolService, PrismaService],
    }).compile();

    resolver = module.get<SchoolResolver>(SchoolResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
