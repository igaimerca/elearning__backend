import { Test, TestingModule } from '@nestjs/testing';
import { ClassOverviewResolver } from './class-overview.resolver';
import { ClassOverviewService } from './class-overview.service';

describe('ClassOverviewResolver', () => {
  let resolver: ClassOverviewResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassOverviewResolver, ClassOverviewService],
    }).compile();

    resolver = module.get<ClassOverviewResolver>(ClassOverviewResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
