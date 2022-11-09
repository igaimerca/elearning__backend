import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestResolver } from './test.resolver';
import { PrismaService } from 'src/database/services/prisma.service';

@Module({
  providers: [TestResolver, TestService,PrismaService]
})
export class TestModule {}
