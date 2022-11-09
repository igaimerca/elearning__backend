import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from 'src/utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateNoteInput } from './dto/create-note.input';
import { UpdateNoteInput } from './dto/update-note.input';

@Injectable()
export class NoteService {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly prismaService: PrismaService) {}

  create(user: User, createNoteInput: CreateNoteInput) {
    return this.prismaService.note.create({
      data: {
        title: createNoteInput.title,
        content: createNoteInput.content,
        isPublic: createNoteInput.isPublic,
        userId: user.id,
      },
    });
  }

  async findMany(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const total = await this.prismaService.note.count({
      where: {
        userId: user.id,
      },
    });
    const data = await this.prismaService.note.findMany({
      skip,
      take: limit,
      where: {
        userId: user.id,
      },
      include: {
        sharedNotes: true,
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

  findOne(id: string) {
    return this.prismaService.note.findUnique({
      where: {
        id,
      },
      include: {
        sharedNotes: true,
      },
    });
  }

  async findNotesSharedWithMe(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const total = await this.prismaService.note.count({
      where: {
        sharedNotes: {
          some: {
            sharedWithId: user.id,
          },
        },
      },
    });
    const data = await this.prismaService.note.findMany({
      skip,
      take: limit,
      where: {
        sharedNotes: {
          some: {
            sharedWithId: user.id,
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

  async findPinnedPrivateNotes(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const total = await this.prismaService.note.count({
      where: {
        isPinned: true,
        isPublic: false,
      },
    });
    const data = await this.prismaService.note.findMany({
      skip,
      take: limit,
      where: {
        isPinned: true,
        isPublic: false,
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

  async findUnPinnedPrivateNotes(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const total = await this.prismaService.note.count({
      where: {
        isPinned: false,
        isPublic: false,
      },
    });
    const data = await this.prismaService.note.findMany({
      skip,
      take: limit,
      where: {
        isPinned: false,
        isPublic: false,
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

  async findPinnedPublicNotes(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const total = await this.prismaService.note.count({
      where: {
        isPinned: true,
        isPublic: true,
      },
    });
    const data = await this.prismaService.note.findMany({
      skip,
      take: limit,
      where: {
        isPinned: true,
        isPublic: true,
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

  async findUnPinnedPublicNotes(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const total = await this.prismaService.note.count({
      where: {
        isPinned: false,
        isPublic: true,
      },
    });
    const data = await this.prismaService.note.findMany({
      skip,
      take: limit,
      where: {
        isPinned: false,
        isPublic: true,
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

  update(id: string, updateNoteInput: UpdateNoteInput) {
    const noteExists = this.prismaService.note.findUnique({
      where: {
        id,
      },
    });

    if (!noteExists) {
      throw new BadRequestException('Note does not exist');
    }

    return this.prismaService.note.update({
      where: {
        id,
      },
      data: {
        title: updateNoteInput.title,
        content: updateNoteInput.content,
        isPublic: updateNoteInput.isPublic,
      },
    });
  }

  async remove(user: User, id: string) {
    const noteExists = await this.prismaService.note.findUnique({
      where: {
        id,
      },
    });

    if (!noteExists) {
      throw new BadRequestException('Note does not exist');
    }

    if (noteExists.userId !== user.id) {
      throw new BadRequestException(
        'Cannot delete note. Note does not belong to current user',
      );
    }
    return this.prismaService.note.delete({
      where: {
        id,
      },
    });
  }

  async shareNote(sharedWithId: string, id: string) {
    const noteExists = await this.prismaService.note.findUnique({
      where: { id },
    });

    if (!noteExists) {
      throw new NotFoundException('Note does not exist');
    }

    const noteSharedWithExactUser =
      await this.prismaService.sharedNote.findFirst({
        where: {
          noteId: id,
          sharedWithId,
        },
      });

    if (noteSharedWithExactUser) {
      throw new NotFoundException(
        'Note has been shared previously with this user',
      );
    }

    await this.prismaService.sharedNote.create({
      data: {
        noteId: id,
        sharedWithId,
      },
    });

    return true;
  }
}
