import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { SuggestionResolver } from './suggestion.resolver';
import { SuggestionService } from './suggestion.service';

@Module({
  providers: [SuggestionResolver, SuggestionService, PrismaService],
})
export class SuggestionModule {}
