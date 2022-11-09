import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { SendGridService } from '../common/services/sendgrid.service';
import { TwoFactorAuthService } from '../common/services/twoFactorAuth.service';
import { PrismaService } from '../database/services/prisma.service';
import { UsersModule } from '../models/users/users.module';
import { UsersResolver } from '../models/users/users.resolver';
import { UsersService } from '../models/users/users.service';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

describe.skip('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthResolver,
        AuthService,
        LocalStrategy,
        JwtStrategy,
        ConfigService,
        TwoFactorAuthService,
        PrismaService,
        SendGridService,
        UsersResolver,
      ],
      imports: [
        UsersModule,
        PassportModule.register({ defaultStrategy: 'jwt ' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '24h',
          },
        }),
      ],
      exports: [AuthService, JwtModule],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
