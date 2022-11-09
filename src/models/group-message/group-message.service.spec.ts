import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { GroupMessageResolver } from './group-message.resolver';
import { GroupMessageService } from './group-message.service';

describe('GroupMessageService', () => {
  let service: GroupMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupMessageResolver, GroupMessageService, PrismaService],
    }).compile();
    service = module.get<GroupMessageService>(GroupMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
