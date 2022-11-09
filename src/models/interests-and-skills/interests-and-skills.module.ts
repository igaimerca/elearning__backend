/* eslint-disable max-len */
import { Module } from '@nestjs/common';
import { InterestsAndSkillsResolver } from './interests-and-skills.resolver';
import { InterestsAndSkillsService } from './interests-and-skills.service';
import { PrismaService } from '../../database/services/prisma.service';

@Module({
  providers: [InterestsAndSkillsResolver, InterestsAndSkillsService, PrismaService]
})
export class InterestsAndSkillsModule {}
