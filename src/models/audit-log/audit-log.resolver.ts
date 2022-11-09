/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */

import { Query, Resolver } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './entities/audit-log.entity';

@Resolver(() => AuditLog)
export class AuditLogResolver {
  constructor(private readonly auditLogService: AuditLogService) {}
  @Query(() => [AuditLog])
  getAuditLogs(@CurrentUser() user: User) {
    return this.auditLogService.getAllAuditLogs(user);
  }
}


