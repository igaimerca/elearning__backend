import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileResolver } from './file.resolver';
import { PrismaService } from '../../database/services/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { FileUploadService } from '../../fileUpload/fileUpload.service';

@Module({
  imports: [HttpModule],
  providers: [FileResolver, FileService, FileUploadService,PrismaService],
})
export class FileModule {}
