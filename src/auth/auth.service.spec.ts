import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { SendGridService } from '../common/services/sendgrid.service';
import { TwoFactorAuthService } from '../common/services/twoFactorAuth.service';
import { PrismaService } from '../database/services/prisma.service';
import { UsersModule } from '../models/users/users.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

describe.skip('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigService,
        UsersModule,
        PassportModule.register({ defaultStrategy: 'jwt ' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '24h',
          },
        }),
      ],
      providers: [
        ConfigService,
        ConfigService,
        AuthResolver,
        AuthService,
        LocalStrategy,
        JwtStrategy,
        TwoFactorAuthService,
        PrismaService,
        SendGridService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
