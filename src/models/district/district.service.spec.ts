import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { DistrictResolver } from './district.resolver';
import { DistrictService } from './district.service';

describe('DistrictService', () => {
  let service: DistrictService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistrictResolver, DistrictService, PrismaService],
    }).compile();
    service = module.get<DistrictService>(DistrictService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
