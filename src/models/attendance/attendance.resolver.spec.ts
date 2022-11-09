import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceService } from './attendance.service';

describe('AttendanceResolver', () => {
  let resolver: AttendanceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceResolver, AttendanceService, PrismaService],
    }).compile();

    resolver = module.get<AttendanceResolver>(AttendanceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
