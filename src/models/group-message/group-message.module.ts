import { Module } from '@nestjs/common';
import { FileUploadModule } from 'src/fileUpload/file.module';
import { PrismaService } from '../../database/services/prisma.service';
import { GroupMessageResolver } from './group-message.resolver';
import { GroupMessageService } from './group-message.service';

@Module({
  imports:[FileUploadModule],
  providers: [GroupMessageResolver, GroupMessageService, PrismaService],
})
export class GroupMessageModule {}
