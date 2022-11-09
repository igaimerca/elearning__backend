import { SetMetadata } from '@nestjs/common';

import {
  Action,
  Subjects,
  DetailSubjects,
} from '../../models/ability/ability.factory';

export const CHECK_ABILITY = 'check_ability';

export interface RequiredRule {
  action: Action;
  subject: Subjects;
  detailSubject?: DetailSubjects;
}

export const CheckAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);
