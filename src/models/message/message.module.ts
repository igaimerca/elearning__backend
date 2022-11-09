import { Module } from '@nestjs/common';
import { FileUploadModule } from '../../fileUpload/file.module';
import { PrismaService } from '../../database/services/prisma.service';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';

@Module({
  imports:[FileUploadModule],
  providers: [MessageResolver, MessageService, PrismaService],
})
export class MessageModule {}
