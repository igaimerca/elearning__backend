/* eslint-disable max-len */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { SendGridService } from '../../common/services/sendgrid.service';
import { TwoFactorAuthService } from '../../common/services/twoFactorAuth.service';
import { PrismaService } from '../../database/services/prisma.service';
import { AbilityFactory } from '../ability/ability.factory';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        UsersService,
        ConfigService,
        PrismaService,
        SendGridService,
        TwoFactorAuthService,
        AbilityFactory,
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
