import { Module } from '@nestjs/common';
import { LiveChatService } from './live-chat.service';
import { LiveChatResolver } from './live-chat.resolver';

@Module({
  providers: [LiveChatResolver, LiveChatService],
})
export class LiveChatModule {}
