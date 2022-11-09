import { Module } from '@nestjs/common';
import { ErrorService } from './error.service';
import { ErrorResolver } from './error.resolver';

@Module({
  providers: [ErrorResolver, ErrorService],
})
export class ErrorModule {}
