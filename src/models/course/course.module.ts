import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { CourseResolver } from './course.resolver';
import { CourseService } from './course.service';
import { FileUploadModule } from 'src/fileUpload/file.module';

@Module({
  imports:[FileUploadModule],
  providers: [CourseResolver, CourseService, PrismaService],
})
export class CourseModule {}
