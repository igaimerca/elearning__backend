import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { KnowledgeBaseResolver } from './knowledge-base.resolver';
import { KnowledgeBaseService } from './knowledge-base.service';

@Module({
  providers: [KnowledgeBaseResolver, KnowledgeBaseService, PrismaService],
})
export class KnowledgeBaseModule {}
