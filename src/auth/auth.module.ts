import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FileUploadModule } from 'src/fileUpload/file.module';

import { SendGridService } from '../common/services/sendgrid.service';
import { TwoFactorAuthService } from '../common/services/twoFactorAuth.service';
import { PrismaService } from '../database/services/prisma.service';
import { DistrictService } from '../models/district/district.service';
import { UsersService } from '../models/users/users.service';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '4h',
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt ' }),
    FileUploadModule
  ],
  providers: [
    AuthResolver,
    AuthService,
    LocalStrategy,
    DistrictService,
    JwtStrategy,
    TwoFactorAuthService,
    PrismaService,
    ConfigService,
    UsersService,
    SendGridService,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }
