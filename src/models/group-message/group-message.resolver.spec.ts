import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/services/prisma.service';
import { GroupMessageResolver } from './group-message.resolver';
import { GroupMessageService } from './group-message.service';

describe('GroupMessageResolver', () => {
  let resolver: GroupMessageResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupMessageResolver, GroupMessageService, PrismaService],
    }).compile();

    resolver = module.get<GroupMessageResolver>(GroupMessageResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
