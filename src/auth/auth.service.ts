/* eslint-disable no-unused-vars */
/* eslint-disable max-statements */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoginAuthInput } from './dto/login-auth.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { User } from '../models/users/entities/user.entity';
import { VerifyAccountLinkingInput } from './dto/verifyAccountLinking.input';
import { SendGridService } from '../common/services/sendgrid.service';
import { PrismaService } from '../database/services/prisma.service';
import { UsersService } from '../models/users/users.service';
import { compare, hash } from '../utils/password';
import { TwoFactorAuthService } from '../common/services/twoFactorAuth.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly emailService: SendGridService,
    private readonly twofactorAuthService: TwoFactorAuthService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  // Private methods
  private async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private generateAccessToken(email: string, id: string, sub: string) {
    const payload = {
      email,
      id,
      sub,
    };

    // Will be expired in 1 day
    //TODO: (@veritem) fix this after refresh token is increased on frontend
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  private async generateRefreshToken(email: string, id: string, sub: string) {
    const payload = {
      email,
      id,
      sub,
    };
    // Will be expired in 4 hours
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '4h',
    });
    const tokenExists = await this.prismaService.refreshToken.findUnique({
      where: { userId: id },
    });

    if (tokenExists) {
      await this.prismaService.refreshToken.update({
        where: { id: tokenExists.id },
        data: {
          userId: id,
          token: refreshToken,
        },
      });
    } else {
      await this.prismaService.refreshToken.create({
        data: {
          userId: id,
          token: refreshToken,
        },
      });
    }

    return refreshToken;
  }

  // Public methods
  public async verifyRefreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prismaService.user.findUnique({
        where: { email: decoded.email },
      });

      return user;
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  public async login(loginData: LoginAuthInput) {
    const { email, password } = loginData;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.tfaEnabled) {
      if (!loginData.tfactorAuthCode) {
        throw new BadRequestException('TFactor Auth Code is required');
      }

      const isTfACodeValid =
        this.twofactorAuthService.isTwoFactorAuthenticationCodeValid(
          loginData.tfactorAuthCode,
          user.tfaSecret,
        );

      if (!isTfACodeValid) {
        throw new UnauthorizedException();
      }
    }

    const { id } = user;
    const accessToken = this.generateAccessToken(email, id, id);
    const refreshToken = await this.generateRefreshToken(email, id, id);

   this.eventEmitter.emit('user.login', { type: 'user.login', data: user });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  // Make refreshToken can be used only once.
  // If refreshToken validation fails, invalidate all next refresh token request
  // so user should login again with password
  public async refreshToken(refreshTokenInput: RefreshTokenInput) {
    const user = await this.verifyRefreshToken(refreshTokenInput.refreshToken);
    if (!user) {
      throw new BadRequestException('Invalid refresh token');
    }

    const tokenExists = await this.prismaService.refreshToken.findUnique({
      where: { userId: user.id },
    });
    if (!tokenExists) {
      throw new BadRequestException("User's refresh token doesn't exist");
    }

    if (tokenExists.token !== refreshTokenInput.refreshToken) {
      await this.prismaService.refreshToken.delete({
        where: { id: tokenExists.id },
      });
      throw new BadRequestException("Refresh token doesn't match");
    }

    const { id, email } = user;
    const accessToken = this.generateAccessToken(email, id, id);
    const refreshToken = await this.generateRefreshToken(email, id, id);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  public async forgotPassword(forgotPasswordInput: ForgotPasswordInput) {
    const { email } = forgotPasswordInput;
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('The user with this email does not exist');
    }

    const { id } = user;
    const accessToken = this.generateAccessToken(email, id, id);

    await this.sendEmail({
      email,
      // eslint-disable-next-line max-len
      verificationLink: `${process.env.FORGOT_PASSWORD_URL}?token=${accessToken}`,
    });

    return {
      message: 'Reset Password link is sent to your email!',
    };
  }

  public async resetPassword(
    user: User,
    resetPasswordInput: ResetPasswordInput,
  ) {
    const { newPassword } = resetPasswordInput;
    const { id } = user;
    const hashedPassword = await hash(newPassword);

    await this.prismaService.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Password reset successfully!',
    };
  }

  public async logout(user: User) {
    const { id } = user;
    await this.prismaService.refreshToken.delete({
      where: { userId: id },
    });

    this.eventEmitter.emit('user.logout', {type:'user.logout', data: user });

    return {
      message: 'Logged out successfully!',
    };
  }

  // async linkAccounts(user: User, email: string) {
  //   const userExists = await this.usersService.findOneByEmail(email);

  //   if (!userExists) {
  //     return new NotFoundException('User does not exist');
  //   }

  //   const linkedAccount = await this.prismaService.accountLinked.create({
  //     data: {
  //       userId: user.id,
  //       provideId: userExists.id,
  //       token:
  //         Math.random().toString(36).substring(2, 15) +
  //         Math.random().toString(36).substring(2, 15),
  //     },
  //   });

  //   // send email to the user
  //   //TODO:(@veritem fix this once frontend will be
  //   // implemented) send email to the user
  //   await this.sendEmail({
  //     email,
  //     verificationLink: `${process.env.FRONTEND_URL}
  //     /auth/account-link?linkId=${linkedAccount.id}
  //     &token=${linkedAccount.token}`,
  //   });

  //   // send email to provider
  //   //TODO:(@veritem fix this once
  //   // frontend will be implemented) send email to the provider
  //   await this.sendEmail({
  //     email: user.email,
  //     verificationLink: `${process.env.FRONTEND_URL}/
  //     auth/account-link?linkId=${linkedAccount.id}
  //     &token=${linkedAccount.token}`,
  //   });

  //   return {
  //     status: 'Email sent for verification',
  //   };
  // }

  // async getQrCode(qrCodeUrl: string) {
  //   return await this.twofactorAuthService.generateQrCode(qrCodeUrl);
  // }

  // async verifyLinkedAccounts(
  //   verifyAccountLinkInput: VerifyAccountLinkingInput,
  // ) {
  //   const linkExists = await this.prismaService.accountLinked.findUnique({
  //     where: {
  //       id: verifyAccountLinkInput.linkId,
  //     },
  //   });

  //   // if (!linkExists) {
  //   //   throw new NotFoundException('Link does not exist');
  //   // }

  //   // if (linkExists.token !== verifyAccountLinkInput.token) {
  //   //   throw new ForbiddenException('Invalid token');
  //   // }

  //   const user = await this.usersService.findOneByEmail(
  //     verifyAccountLinkInput.email,
  //   );

  //   if (!user) {
  //     throw new NotFoundException('User does not exist');
  //   }

  //   if (linkExists.userId === user.id) {
  //     if (linkExists.userVerified) {
  //       throw new ForbiddenException('User already verified');
  //     } else {
  //       await this.prismaService.accountLinked.update({
  //         where: {
  //           id: verifyAccountLinkInput.linkId,
  //         },
  //         data: {
  //           userVerified: true,
  //         },
  //       });
  //     }
  //   } else if (linkExists.provideId === user.id) {
  //     if (linkExists.providerVerified) {
  //       throw new ForbiddenException('Provider already verified');
  //     } else {
  //       await this.prismaService.accountLinked.update({
  //         where: {
  //           id: verifyAccountLinkInput.linkId,
  //         },
  //         data: {
  //           providerVerified: true,
  //         },
  //       });
  //     }

  //     if (linkExists.userVerified && linkExists.providerVerified) {
  //       await this.prismaService.user.update({
  //         where: {
  //           id: user.id,
  //         },
  //         data: {
  //           accountLinked: true,
  //         },
  //       });

  //       await this.prismaService.user.update({
  //         where: {
  //           id: linkExists.provideId,
  //         },
  //         data: {
  //           accountLinked: true,
  //         },
  //       });
  //     }

  //     return {
  //       status: 'Account linked successfully',
  //     };
  //   }
  // }

  // async disableAccountLink(user: User) {
  //   try {
  //     await this.prismaService.user.update({
  //       where: {
  //         id: user.id,
  //       },
  //       data: {
  //         accountLinked: false,
  //       },
  //     });

  //     return {
  //       status: 'Account unlinked successfully',
  //     };
  //   } catch (error) {
  //     throw new ForbiddenException('Unable to unlink account');
  //   }
  // }

  private async sendEmail({
    email,
    verificationLink,
  }: {
    email: string;
    verificationLink: string;
  }) {
    const mail = {
      to: email,
      from: 'no-reply@gradearc.com',
      templateId: 'd-0148d089f1d644aeaacaa9f92aa27c89',
      dynamicTemplateData: {
        email,
        verificationLink,
      },
    };
    await this.emailService.send(mail);
  }
}
