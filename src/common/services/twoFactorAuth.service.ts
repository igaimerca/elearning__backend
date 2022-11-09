import { BadRequestException, Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../database/services/prisma.service';

@Injectable()
export class TwoFactorAuthService {
  constructor(private readonly prismaService: PrismaService) { }

  // Public methods
  public async generateTwoFactorAuthSecret(email: string) {
    const secret = await speakeasy.generateSecret({
      name: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      issuer: email,
    });

    await this.prismaService.user.update({
      where: { email },
      data: { tfaSecret: secret.base32 },
    });

    return QRCode.toDataURL(secret.otpauth_url);
  }

  public async turnOnTwoFactorAuthentication(userId: string) {
    return this.prismaService.user.update({
      data: {
        tfaEnabled: true,
      },
      where: {
        id: userId,
      },
    });
  }

  public isTwoFactorAuthenticationCodeValid(token: string, secret: string) {
    const verifyToken = speakeasy.totp.verify({
      secret,
      token,
      encoding: 'base32',
    });

    if (!verifyToken) {
      throw new BadRequestException('Invalid code');
    }
    return verifyToken;
  }
}
