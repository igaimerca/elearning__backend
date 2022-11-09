import { Test, TestingModule } from '@nestjs/testing';
import { InterestsAndSkillsService } from './interests-and-skills.service';

describe('InterestsAndSkillsService', () => {
  let service: InterestsAndSkillsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterestsAndSkillsService],
    }).compile();

    service = module.get<InterestsAndSkillsService>(InterestsAndSkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
