import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { ParentChildResolver } from './parent-child.resolver';
import { ParentChildService } from './parent-child.service';

@Module({
  providers: [ParentChildResolver, ParentChildService, PrismaService],
})
export class ParentChildModule {}
