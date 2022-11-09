import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { PermissionModule } from '../ability/ability.module';
import { SchoolResolver } from './school.resolver';
import { SchoolService } from './school.service';
import { AbilitySchoolService } from './ability-school.service';
import { FileUploadModule } from 'src/fileUpload/file.module';

@Module({
  imports: [FileUploadModule, PermissionModule],
  providers: [
    SchoolResolver,
    SchoolService,
    PrismaService,
    AbilitySchoolService,
  ],
  exports: [SchoolService, AbilitySchoolService],
})
export class SchoolModule {}
