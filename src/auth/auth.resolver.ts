/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';

import { CurrentUser } from '../common/decorators/currentUser.decorator';
import { Public } from '../common/decorators/skipAuth.decorator';
import { User } from '../models/users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginAuthInput } from './dto/login-auth.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { LoginResponse } from './entities/login-response.entity';
import { LogoutResponse } from './entities/logout-response.entity';
import { VerifyAccountLinkingInput } from './dto/verifyAccountLinking.input';
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse, { name: 'login' })
  @Public()
  login(@Args('loginData') loginInput: LoginAuthInput) {
    return this.authService.login(loginInput);
  }

  @Mutation(() => LoginResponse, { name: 'refreshToken' })
  @Public()
  refreshToken(
    @Args('refreshTokenInput') refreshTokenInput: RefreshTokenInput,
  ) {
    return this.authService.refreshToken(refreshTokenInput);
  }

  @Mutation(() => LogoutResponse, { name: 'forgotPassword' })
  @Public()
  forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput,
  ) {
    return this.authService.forgotPassword(forgotPasswordInput);
  }

  @Mutation(() => LogoutResponse)
  resetPassword(
    @CurrentUser() user: User,
    @Args('resetPasswordInput')
    resetPasswordInput: ResetPasswordInput,
  ) {
    return this.authService.resetPassword(user, resetPasswordInput);
  }

  @Mutation(() => LogoutResponse, { name: 'logout' })
  logout(@CurrentUser() user) {
    return this.authService.logout(user);
  }

  // @Query(() => AuthToken)
  // @Public()
  // verifytfaAuth(@Args('token') token: string, @Args('userId') userId: string) {
  //   return this.authService.verifytfaAuth(token, userId);
  // }

  // @Query(() => Boolean)
  // @Public()
  // getQrCode(@Args('qrCodeUrl') qrCodeUrl: string) {
  //   return this.authService.getQrCode(qrCodeUrl);
  // }

  @Query(() => User)
  currentUser(@CurrentUser() user) {
    return user;
  }

  // @Mutation(() => LinkAccountRespose)
  // linkAccounts(
  //   @CurrentUser() user,
  //   @Args('email', {
  //     description: 'Email you want to link the currrent logged in user with',
  //   })
  //   email: string,
  // ) {
  //   return this.authService.linkAccounts(user, email);
  // }

  // @Mutation(() => LinkAccountRespose)
  // disableAccountLink(@CurrentUser() user) {
  //   return this.authService.disableAccountLink(user);
  // }

  // @Mutation(() => LinkAccountRespose)
  // verifyLinkedAccounts(
  //   @Args('verifyAccountInput')
  //   verifyAccountLinkInput: VerifyAccountLinkingInput,
  // ) {
  //   return this.authService.verifyLinkedAccounts(verifyAccountLinkInput);
  // }
}
