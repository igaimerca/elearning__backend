import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderResolver } from './folder.resolver';
import { PrismaService } from '../../database/services/prisma.service';

@Module({
  providers: [FolderResolver, FolderService,PrismaService],
})
export class FolderModule {}
