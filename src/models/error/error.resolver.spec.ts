import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { ErrorResolver } from './error.resolver';
import { ErrorService } from './error.service';

describe('ErrorResolver', () => {
  let resolver: ErrorResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorResolver, ErrorService, PrismaService],
    }).compile();

    resolver = module.get<ErrorResolver>(ErrorResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
