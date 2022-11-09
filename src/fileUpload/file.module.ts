import { Module } from '@nestjs/common';
import { FileUploadService } from './fileUpload.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/database/services/prisma.service';
import { FileController } from './file.controller';

@Module({
  imports: [HttpModule],
  controllers:[FileController],
  providers: [FileUploadService,PrismaService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
