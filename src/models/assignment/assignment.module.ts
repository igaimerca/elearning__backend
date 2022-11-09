import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { AssignmentResolver } from './assignment.resolver';
import { AssignmentService } from './assignment.service';

@Module({
  providers: [AssignmentResolver, AssignmentService, PrismaService],
})
export class AssignmentModule {}
