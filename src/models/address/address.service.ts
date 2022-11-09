/* eslint-disable no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { PrismaService } from '../../database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createAddressInput: CreateAddressInput) {
    return this.prismaService.address.create({
      data: { ...createAddressInput },
    });
  }

  async findMany(skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.address.count({});
    const data = await this.prismaService.address.findMany({
      skip,
      take: limit,
    });

    return {
      data,
      pageInfo: {
        total,
        skip,
        limit,
      },
    };
  }

  findOne(id: string) {
    return this.prismaService.address.findUnique({
      where: { id },
    });
  }

  update(updateAddressInput: UpdateAddressInput) {
    return this.prismaService.address.update({
      where: { id: updateAddressInput.id },
      data: {
        ...updateAddressInput,
      },
    });
  }

  remove(id: string) {
    return this.prismaService.address.delete({ where: { id } });
  }
}
