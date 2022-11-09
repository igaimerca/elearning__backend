/* eslint-disable max-len */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { SendGridService } from '../../common/services/sendgrid.service';
import { TwoFactorAuthService } from '../../common/services/twoFactorAuth.service';
import { PrismaService } from '../../database/services/prisma.service';
import { PermissionModule } from '../ability/ability.module';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PermissionModule],
      providers: [
        UsersResolver,
        UsersService,
        PrismaService,
        ConfigService,
        TwoFactorAuthService,
        SendGridService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
