import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { AssignmentResolver } from './assignment.resolver';
import { AssignmentService } from './assignment.service';

describe('AssignmentResolver', () => {
  let resolver: AssignmentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentResolver, AssignmentService, PrismaService],
    }).compile();

    resolver = module.get<AssignmentResolver>(AssignmentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
