import { Test, TestingModule } from '@nestjs/testing';
import { InterestsAndSkillsResolver } from './interests-and-skills.resolver';

describe('InterestsAndSkillsResolver', () => {
  let resolver: InterestsAndSkillsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterestsAndSkillsResolver],
    }).compile();

    resolver = module.get<InterestsAndSkillsResolver>(InterestsAndSkillsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
