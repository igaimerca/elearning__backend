/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadStatus } from '@prisma/client';

import { PrismaService } from '../../database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateSuggestionInput } from './dto/create-suggestion.input';
import { UpdateSuggestionInput } from './dto/update-suggestion.input';

@Injectable()
export class SuggestionService {
  constructor(private readonly prismaService: PrismaService) {}

  create(user: User, createSuggestionInput: CreateSuggestionInput) {
    return this.prismaService.suggestion.create({
      data: {
        ...createSuggestionInput,
        submitterId: user.id,
      },
      include: {
        submitter: true,
      },
    });
  }

  async findMany(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.suggestion.count({});
    const data = await this.prismaService.suggestion.findMany({
      skip,
      take: limit,
      include: {
        submitter: true,
        suggestionAdminReads: {
          where: {
            adminId: user.id,
          },
          select: {
            status: true,
          },
        },
      },
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
    const suggestion = await this.prismaService.suggestion.findUnique({
      where: {
        id,
      },
      include: {
        submitter: true,
        suggestionAdminReads: {
          where: {
            adminId: user.id,
          },
          select: {
            status: true,
          },
        },
      },
    });

    if (!suggestion) {
      throw new NotFoundException('Suggestion does not exist');
    }

    return suggestion;
  }

  update(id: string, updateSuggestionInput: UpdateSuggestionInput) {
    const suggestionExists = this.prismaService.suggestion.findUnique({
      where: {
        id,
      },
    });

    if (!suggestionExists) {
      throw new NotFoundException(`Suggestion with id ${id} not found`);
    }

    return this.prismaService.suggestion.update({
      where: {
        id,
      },
      data: {
        ...updateSuggestionInput,
      },
      include: {
        submitter: true,
      },
    });
  }

  remove(id: string) {
    const suggestionExists = this.prismaService.suggestion.findUnique({
      where: {
        id,
      },
    });

    if (!suggestionExists) {
      throw new NotFoundException(`Suggestion with id ${id} not found`);
    }

    return this.prismaService.suggestion.delete({
      where: {
        id,
      },
    });
  }

  async setAdminReadStatus(user: User, id: string, status: ReadStatus) {
    const suggestionExists = await this.prismaService.suggestion.findUnique({
      where: { id },
    });

    if (!suggestionExists) {
      throw new NotFoundException('Suggestion does not exist');
    }

    const adminHasRead = await this.prismaService.suggestionAdminRead.findFirst({
      where: {
        suggestionId: id,
        adminId: user.id,
      },
    });

    if (!adminHasRead) {
      await this.prismaService.suggestionAdminRead.create({
        data: {
          suggestionId: id,
          adminId: user.id,
        },
      });
      return true;
    }

    await this.prismaService.suggestionAdminRead.update({
      where: {
        id: adminHasRead.id,
      },
      data: {
        status,
      },
    });

    return true;
  }
}
