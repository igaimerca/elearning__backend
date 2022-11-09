import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { AddressService } from './address.service';

@Module({
  providers: [AddressService, PrismaService],
  exports: [AddressService],
})
export class AddressModule {}
