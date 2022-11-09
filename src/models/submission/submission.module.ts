import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/services/prisma.service';
import { PermissionModule } from '../ability/ability.module';
import { SubmissionService } from './submission.service';
import { SubmissionResolver } from './submission.resolver';
import { FileUploadModule } from 'src/fileUpload/file.module';

@Module({
  imports: [PermissionModule,FileUploadModule],
  providers: [SubmissionResolver, SubmissionService, PrismaService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
