import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/services/prisma.service';
import { AnnouncementResolver } from './announcement.resolver';
import { AnnouncementService } from './announcement.service';

@Module({
  providers: [AnnouncementResolver, AnnouncementService, PrismaService],
})
export class AnnouncementModule {}
