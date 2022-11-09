import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { SchoolResolver } from './school.resolver';
import { SchoolService } from './school.service';

describe('SchoolService', () => {
  let service: SchoolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolResolver, SchoolService, PrismaService],
    }).compile();

    service = module.get<SchoolService>(SchoolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
