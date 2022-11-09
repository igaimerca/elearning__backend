import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard as PassportAuthGaurd } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/skipAuth.decorator';

@Injectable()
export class AuthGuard extends PassportAuthGaurd('jwt') {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext): any {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }
    const ctx = GqlExecutionContext.create(context);

    return ctx.getContext().req;
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
