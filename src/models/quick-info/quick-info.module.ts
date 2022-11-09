import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { QuickInfoResolver } from './quick-info.resolver';
import { QuickInfoService } from './quick-info.service';

@Module({
  providers: [QuickInfoResolver, QuickInfoService, PrismaService],
})
export class QuickInfoModule {}
