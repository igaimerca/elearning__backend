import { Test, TestingModule } from '@nestjs/testing';
import { SupportResolver } from './support.resolver';
import { SupportService } from './support.service';

describe('SupportResolver', () => {
  let resolver: SupportResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupportResolver, SupportService],
    }).compile();

    resolver = module.get<SupportResolver>(SupportResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
