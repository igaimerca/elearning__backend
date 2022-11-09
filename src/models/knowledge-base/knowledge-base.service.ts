/* eslint-disable max-len */
import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/services/prisma.service';
import { CreateKnowledgeBaseInput } from './dto/create-knowledge-base.input';
import { UpdateKnowledgeBaseInput } from './dto/update-knowledge-base.input';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { Roles } from '@prisma/client';

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly prismaService: PrismaService) {}

  create(userId: string, createKnowledgeBaseInput: CreateKnowledgeBaseInput) {
    return this.prismaService.knowledgeBase.create({
      data: {
        ...createKnowledgeBaseInput,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async findAll(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (user.role === Roles.CCSA || user.role === Roles.CSA) {
      const total = await this.prismaService.knowledgeBase.count({});
      const data = await this.prismaService.knowledgeBase.findMany({
        include: { user: true },
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

    const total = await this.prismaService.knowledgeBase.count({
      where: { userId: user.id },
    });
    const data = await this.prismaService.knowledgeBase.findMany({
      where: { userId: user.id },
      include: { user: true },
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

  async findPublished(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (user.role === Roles.CCSA || user.role === Roles.CSA) {
      const total = await this.prismaService.knowledgeBase.count({
        where: {
          isPublic: true,
        },
      });
      const data = await this.prismaService.knowledgeBase.findMany({
        where: {
          isPublic: true,
        },
        include: { user: true },
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

    const total = await this.prismaService.knowledgeBase.count({
      where: {
        isPublic: true,
        userId: user.id,
      },
    });
    const data = await this.prismaService.knowledgeBase.findMany({
      where: {
        isPublic: true,
        userId: user.id,
      },
      include: { user: true },
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

  async findOne(user: User, id: string) {
    const knowledgeBaseExists = await this.prismaService.knowledgeBase.findUnique({
      where: { id },
      include: { user: true },
    });

    if (user.role !== Roles.CCSA && user.role !== Roles.CSA) {
      if (knowledgeBaseExists.userId !== user.id) {
        throw new ForbiddenException('You are not authorized');
      }
    }

    return knowledgeBaseExists;
  }

  async update(user: User, id: string, updateKnowledgeBaseInput: UpdateKnowledgeBaseInput) {
    const knowledgeBaseExists = await this.prismaService.knowledgeBase.findUnique({
      where: { id },
    });

    if (user.role !== Roles.CCSA && user.role !== Roles.CSA) {
      if (knowledgeBaseExists.userId !== user.id) {
        throw new ForbiddenException('You are not authorized');
      }
    }

    return this.prismaService.knowledgeBase.update({
      where: { id },
      data: {
        ...updateKnowledgeBaseInput,
      },
    });
  }

  async remove(user: User, id: string) {
    const knowledgeBaseExists = await this.prismaService.knowledgeBase.findUnique({
      where: { id },
    });

    if (user.role !== Roles.CCSA && user.role !== Roles.CSA) {
      if (knowledgeBaseExists.userId !== user.id) {
        throw new ForbiddenException('You are not authorized');
      }
    }

    return this.prismaService.knowledgeBase.delete({
      where: { id },
    });
  }

  async search(user: User, query: string, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    if (user.role === Roles.CCSA || user.role === Roles.CSA) {
      const total = await this.prismaService.knowledgeBase.count({
        where: {
          OR: [{ title: { contains: query } }],
        },
      });
      const data = await this.prismaService.knowledgeBase.findMany({
        where: {
          OR: [{ title: { contains: query } }],
        },
        include: { user: true },
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

    const total = await this.prismaService.knowledgeBase.count({
      where: {
        OR: [{ title: { contains: query } }],
        userId: user.id,
      },
    });
    const data = await this.prismaService.knowledgeBase.findMany({
      where: {
        OR: [{ title: { contains: query } }],
        userId: user.id,
      },
      include: { user: true },
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
}
