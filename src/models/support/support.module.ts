import { Module } from '@nestjs/common';
import { SendGridService } from 'src/common/services/sendgrid.service';
import { SupportResolver } from './support.resolver';
import { SupportService } from './support.service';

@Module({
  providers: [SupportResolver, SupportService, SendGridService],
})
export class SupportModule {}
