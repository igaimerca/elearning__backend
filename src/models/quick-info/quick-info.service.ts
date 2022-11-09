import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Injectable
} from '@nestjs/common';

import { PrismaService } from '../../database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateQuickInfoInput } from './dto/create-quick-info.input';
import { UpdateQuickInfoInput } from './dto/update-quick-info.input';

@Injectable()
export class QuickInfoService {
  constructor(private readonly prismaService: PrismaService) {}

  create(id: string, createQuickInfoInput: CreateQuickInfoInput) {
    if (!createQuickInfoInput.title && !createQuickInfoInput.description) {
      throw new BadRequestException(
        'Title  or description can be null but not both',
      );
    }

    return this.prismaService.quickInfo.create({
      data: {
        title: createQuickInfoInput.title,
        description: createQuickInfoInput.description,
        userId: id,
      },
    });
  }

  async findMany(userId: string, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const where = { userId };
    const total = await this.prismaService.quickInfo.count({ where });
    const data = await this.prismaService.quickInfo.findMany({
      where,
      include: {
        user: true,
      },
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

  async findOne(userId: string, id: string) {
    const quickInfo = await this.prismaService.quickInfo.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!quickInfo) {
      throw new NotFoundException('QuickInfo not found');
    }

    if (quickInfo.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to access this QuickInfo',
      );
    }

    return quickInfo;
  }

  async update(
    user: User,
    id: string,
    updateQuickInfoInput: UpdateQuickInfoInput,
  ) {
    if (!updateQuickInfoInput.title && !updateQuickInfoInput.description) {
      throw new BadRequestException(
        'Title  or description can be null but not both',
      );
    }

    const quickNotExits = await this.prismaService.quickInfo.findUnique({
      where: {
        id,
      },
    });

    if (!quickNotExits) {
      throw new NotFoundException('Quick info not found');
    }

    if (quickNotExits.userId !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to update this quick info',
      );
    }

    return this.prismaService.quickInfo.update({
      where: {
        id,
      },
      data: {
        title: updateQuickInfoInput.title,
        description: updateQuickInfoInput.description,
      },
    });
  }

  async remove(user: User, id: string) {
    const quickInfo = await this.prismaService.quickInfo.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!quickInfo) {
      throw new NotFoundException('Quick info not found');
    }

    if (quickInfo.userId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this quick info.',
      );
    }

    return this.prismaService.quickInfo.delete({
      where: {
        id,
      },
    });
  }
}
