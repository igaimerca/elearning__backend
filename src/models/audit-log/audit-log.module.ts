import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogResolver } from './audit-log.resolver';
import { PrismaService } from 'src/database/services/prisma.service';

@Module({
  providers: [AuditLogResolver, AuditLogService, PrismaService],
})
export class AuditLogModule {}
