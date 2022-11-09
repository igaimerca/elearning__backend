import { Test, TestingModule } from '@nestjs/testing';
import { LiveChatResolver } from './live-chat.resolver';
import { LiveChatService } from './live-chat.service';

describe('LiveChatResolver', () => {
  let resolver: LiveChatResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiveChatResolver, LiveChatService],
    }).compile();

    resolver = module.get<LiveChatResolver>(LiveChatResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
