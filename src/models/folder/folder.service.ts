import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from 'src/utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateFolderInput } from './dto/create-folder.input';
import { UpdateFolderInput } from './dto/update-folder.input';

@Injectable()
export class FolderService {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: User, createFolderInput: CreateFolderInput) {
    if (createFolderInput.parentFolderId){
      const data = await this.prismaService.folder.findFirst({
        where: {
          userId: user.id,
          id: createFolderInput.parentFolderId
        }
      });
      if (!data) {
        throw new NotFoundException('Parent Folder does not exist');
      }
    }

    const duplicate = await this.prismaService.folder.findFirst({
      where: {
        userId: user.id,
        name: createFolderInput.name,
        parentFolderId: createFolderInput.parentFolderId
      },
      include: {
        parentFolder: true,
      },
    });
    if (duplicate) {
      throw new BadRequestException(`Folder ${createFolderInput.name} already exist in ${duplicate.parentFolder?.name || 'your drive'}`);
    }

    return this.prismaService.folder.create({
      data: {
        name: createFolderInput.name,
        color: createFolderInput.color,
        parentFolderId: createFolderInput.parentFolderId,
        isHidden: createFolderInput.isHidden,
        userId: user.id,
      },
    });
  }

  async findMany(user: User,parentFolderId: string, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const where = parentFolderId ? {
      userId: user.id,
      parentFolderId
    } : {
      OR: [{
        isHidden: false
          },{
        userId: user.id,
        parentFolderId
          }]
      };

    const total = await this.prismaService.folder.count({
      where,
    });
    const data = await this.prismaService.folder.findMany({
      skip,
      take: limit,
      where,
      include: {
        user:true,
        sharedFolders: {
          include: {
            sharedWith: true
          }
        },
        files: true,
        subFolders: true,
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
    const data = await this.prismaService.folder.findUnique({
      where: {
        id,
      },
      include: {
        user:true,
        sharedFolders: true,
        subFolders: true,
        files: true,
      },
    });
    if (!data) {
      throw new NotFoundException('Folder does not exist');
    }
    if (data.userId !== user.id && data.isHidden) {
      const userfound:boolean = data.sharedFolders.filter(x=>x.sharedWithId === user.id).length > 0;

      if (!userfound) {
        throw new NotFoundException('You don\'t have access');
      }
    }
    return data;
  }

  async findFoldersSharedWithMe(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const total = await this.prismaService.folder.count({
      where: {
        sharedFolders: {
          some: {
            sharedWithId: user.id,
          },
        },
      },
    });
    const data = await this.prismaService.folder.findMany({
      skip,
      take: limit,
      where: {
        sharedFolders: {
          some: {
            sharedWithId: user.id,
          },
        },
      },
      include: {
        user: true,
        subFolders: true,
        sharedFolders: {
          include: {
            sharedWith: true
          }
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

  async update(id: string, updateFolderInput: UpdateFolderInput) {
    const folderExists = await this.prismaService.folder.findUnique({
      where: {
        id,
      },
    });

    if (!folderExists) {
      throw new NotFoundException('Folder does not exist');
    }

    if (updateFolderInput.parentFolderId){
      const data = await this.prismaService.folder.findFirst({
        where: {
          userId: folderExists.userId,
          id: updateFolderInput.parentFolderId
        }
      });
      if (!data) {
        throw new NotFoundException('Parent Folder does not exist');
      }
    }

    const duplicate = await this.prismaService.folder.findFirst({
      where: {
        userId: folderExists.userId,
        name: updateFolderInput.name,
        parentFolderId: updateFolderInput.parentFolderId,
        id:{
          not: updateFolderInput.id
        }
      },
      include: {
        parentFolder: true,
      },
    });
    if (duplicate) {
      throw new BadRequestException(`Folder ${updateFolderInput.name} already exist in ${duplicate.parentFolder?.name || 'your drive'}`);
    }

    return this.prismaService.folder.update({
      where: {
        id,
      },
      data: {
        name: updateFolderInput.name,
        color: updateFolderInput.color,
        parentFolderId: updateFolderInput.parentFolderId,
        isHidden: updateFolderInput.isHidden,
      },
    });
  }

  async remove(user: User, id: string) {
    const folderExists = await this.prismaService.folder.findUnique({
      where: {
        id,
      },
    });

    if (!folderExists) {
      throw new NotFoundException('Folder does not exist');
    }

    if (folderExists.userId !== user.id) {
      throw new BadRequestException(
        'Cannot delete folder. Folder does not belong to current user',
      );
    }
    return this.prismaService.folder.delete({
      where: {
        id,
      },
    });
  }

  async shareFolder(user: User, sharedWithId: string, id: string) {



    const folderExists = await this.prismaService.folder.findUnique({
      where: { id },
    });

    if (!folderExists) {
      throw new NotFoundException('Folder does not exist');
    }

    if (folderExists.userId !== user.id) {
      throw new BadRequestException(
        'Cannot share folder. Folder does not belong to current user',
      );
    }

    if (sharedWithId === user.id) {
      throw new BadRequestException(
        'Cannot share folder. Folder already belong to current user',
      );
    }
    const userExist = await this.prismaService.user.findUnique({
      where: { id: sharedWithId },
    });

    if (!userExist) {
      throw new NotFoundException('User does not exist');
    }

    const folderSharedWithExactUser =
      await this.prismaService.sharedFolder.findFirst({
        where: {
          folderId: id,
          sharedWithId,
        },
      });

    if (folderSharedWithExactUser) {
      throw new NotFoundException(
        'Folder has been shared previously with this user',
      );
    }

    await this.prismaService.sharedFolder.create({
      data: {
        folderId: id,
        sharedWithId,
      },
    });

    return true;
  }
}
