import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { DistrictResolver } from './district.resolver';
import { DistrictService } from './district.service';

describe('DistrictResolver', () => {
  let resolver: DistrictResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistrictResolver, DistrictService, PrismaService],
    }).compile();

    resolver = module.get<DistrictResolver>(DistrictResolver);
  });

  it('should create a district', () => {
    expect(resolver).toBeDefined();
  });
});
