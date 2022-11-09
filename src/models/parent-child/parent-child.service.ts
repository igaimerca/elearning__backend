import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { CreateParentChildInput } from './dto/create-parent-child.input';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';

@Injectable()
export class ParentChildService {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly prismaService: PrismaService) {}

  create(dto: CreateParentChildInput) {
    return this.prismaService.parentChild.create({
      data: {
        parent: {
          connect: { id: dto.parentId },
        },
        child: {
          connect: { id: dto.childId },
        },
        relationship: dto.relationship,
        address: {
          create: { ...dto.address },
        },
      },
      include: {
        parent: true,
        child: true,
        address: true,
      },
    });
  }

  findOne(id: string) {
    return this.prismaService.parentChild.findUnique({
      where: {
        id,
      },
      include: {
        parent: true,
        child: true,
        address: true,
      },
    });
  }

  remove(id: string) {
    const relationExists = this.prismaService.parentChild.findUnique({
      where: {
        id,
      },
    });

    if (!relationExists) {
      throw new BadRequestException('Relation does not exist');
    }

    return this.prismaService.parentChild.delete({
      where: {
        id,
      },
      include: {
        parent: true,
        child: true,
        address: true,
      },
    });
  }

  findParentChildren(parentId: string, skip = 0, limit = 10) {
    return this.prismaService.parentChild.findMany({
      where: {
        parentId,
      },
      include: {
        parent: true,
        child: true,
        address: true,
      },
      skip,
      take: limit,
    });
  }
}
