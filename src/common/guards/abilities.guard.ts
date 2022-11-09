/* eslint-disable max-len */
/* eslint-disable max-statements */
import { ForbiddenError } from '@casl/ability';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../common/decorators/skipAuth.decorator';
import { AbilityFactory } from '../../models/ability/ability.factory';
import { CHECK_ABILITY, RequiredRule } from '../decorators/abilities.decorator';
import { User } from '../../models/users/entities/user.entity';
import { AbilityUserService } from '../../models/users/ability-user.service';
import { AbilitySchoolService } from '../../models/school/ability-school.service';
import { School } from '../../models/school/entities/school.entity';

@Injectable()
export class AbiltiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: AbilityFactory,
    private abilityUserService: AbilityUserService,
    private abilitySchoolService: AbilitySchoolService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const rules =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];

    const ctx = GqlExecutionContext.create(context);

    const user = context.getType() === 'http' ? context.switchToHttp().getRequest().user :  ctx.getContext().req.user;

    const ability = this.caslAbilityFactory.defineAbility(user);

    try {
      for (const rule of rules) {
        const { action, detailSubject } = rule;
        let subject: any = rule.subject;

        if (subject === User) {
          subject = await this.abilityUserService.getSubjectInstance(
            action,
            ctx,
            detailSubject,
          );
          subject.__typename = User;
        } else if (subject === School) {
          subject = await this.abilitySchoolService.getSubjectInstance(
            action,
            ctx,
            detailSubject,
          );
          subject.__typename = School;
        }

        ForbiddenError.from(ability).throwUnlessCan(action, subject);
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException();
      }
    }
  }
}
