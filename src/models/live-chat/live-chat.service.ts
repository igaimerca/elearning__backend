/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateLiveChatInput } from './dto/create-live-chat.input';
import { UpdateLiveChatInput } from './dto/update-live-chat.input';

@Injectable()
export class LiveChatService {
  create(createLiveChatInput: CreateLiveChatInput) {
    return 'This action adds a new liveChat';
  }

  findAll() {
    return 'This action returns all liveChat';
  }

  findOne(id: number) {
    return 'This action returns a #${id} liveChat';
  }

  update(id: number, updateLiveChatInput: UpdateLiveChatInput) {
    return `This action updates a #${id} liveChat`;
  }

  remove(id: number) {
    return `This action removes a #${id} liveChat`;
  }
}
