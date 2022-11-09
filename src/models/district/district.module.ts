import { Module } from '@nestjs/common';
import { FileUploadModule } from 'src/fileUpload/file.module';
import { PrismaService } from '../../database/services/prisma.service';
import { PermissionModule } from '../ability/ability.module';
import { DistrictResolver } from './district.resolver';
import { DistrictService } from './district.service';

@Module({
  providers: [DistrictResolver, DistrictService, PrismaService],
  imports: [PermissionModule,FileUploadModule],
  exports: [DistrictService],
})
export class DistrictModule {}
