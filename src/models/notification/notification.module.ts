/* eslint-disable max-len */
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { PrismaService } from '../../database/services/prisma.service';
import { SendGridService } from 'src/common/services/sendgrid.service';

@Module({
  providers: [NotificationResolver, NotificationService, PrismaService, SendGridService]
})
export class NotificationModule { }
