/* eslint-disable max-len */
import { Module } from '@nestjs/common';

import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { AbilityUserService } from './ability-user.service';
import { SendGridService } from 'src/common/services/sendgrid.service';
import { TwoFactorAuthService } from '../../common/services/twoFactorAuth.service';
import { PrismaService } from 'src/database/services/prisma.service';
import { PermissionModule } from '../ability/ability.module';
import { DistrictService } from '../district/district.service';
import { FileUploadModule } from 'src/fileUpload/file.module';
import { ClassOverviewModule } from './class-overview/class-overview.module';

@Module({
  imports: [PermissionModule,FileUploadModule, ClassOverviewModule],
  providers: [
    UsersResolver,
    UsersService,
    PrismaService,
    SendGridService,
    TwoFactorAuthService,
    AbilityUserService,
    DistrictService,
  ],
  exports: [UsersService, AbilityUserService],
})
export class UsersModule { }
