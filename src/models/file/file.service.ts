/* eslint-disable max-len */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from 'src/utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateFileInput } from './dto/create-file.input';
import { UpdateFileInput } from './dto/update-file.input';
import * as mime from 'mime';
import * as FormData from 'form-data';
import { FileUploadService } from '../../fileUpload/fileUpload.service';
import { FileType } from '../../common/enums/fileType.enum';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { ForbiddenException } from '@nestjs/common';
import { Roles } from '.prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class FileService {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly prismaService: PrismaService,
    // eslint-disable-next-line no-unused-vars
    private readonly fileUploadService: FileUploadService,
    // eslint-disable-next-line no-unused-vars
    private readonly eventEmitter:EventEmitter2,
  ) {}

  // eslint-disable-next-line max-statements
  async create(
    user: User,
    createFileInput: CreateFileInput,
    token: string,
    { createReadStream, mimetype, filename }: GraphQLUpload,
  ) {
    if (createFileInput.folderId) {
      const data = await this.prismaService.folder.findFirst({
        where: {
          userId: user.id,
          id: createFileInput.folderId,
        },
      });
      if (!data) {
        throw new NotFoundException('Folder does not exist');
      }
    }

    if (!createFileInput.name || !createFileInput.name.length) {
      createFileInput.name = filename;
    }

    const duplicate = await this.prismaService.file.findFirst({
      where: {
        userId: user.id,
        name: createFileInput.name,
        folderId: createFileInput.folderId,
      },
      include: {
        folder: true,
      },
    });
    if (duplicate) {
      throw new BadRequestException(
        `File ${createFileInput.name} already exist in ${
          duplicate.folder?.name || 'your drive'
        }`,
      );
    }

    const formData = new FormData();
    formData.append('file', createReadStream(), {
      filename,
      contentType: mimetype,
    });
    formData.append(
      'path',
      await this.fileUploadService.getDynamicFilePath(
        FileType.UserDriveFile,
        user.id,
      ),
    );
    formData.append('public', 'false');

    const { url, size } = await this.fileUploadService.upload(formData, token);

    const data = await this.prismaService.file.create({
      data: {
        name: createFileInput.name,
        type: mime.getExtension(mimetype),
        size: size,
        filePath: url,
        folderId: createFileInput.folderId,
        userId: user.id,
      },
    });

    await this.prismaService.userFileAccess.create({
      data: {
        userId: user.id,
        fileId: data.id,
      },
    });

    return data;
  }

  async findMany(
    user: User,
    folderId: string,
    listByFolder: boolean,
    skip: number,
    limit: number,
  ) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const obj = listByFolder
      ? {
          userId: user.id,
          folderId,
        }
      : {
          userId: user.id,
        };
    let where;

    if (!folderId) {
      where = {
        OR: [
          {
            folder: {
              isHidden: false,
            },
          },
          {
            ...obj,
          },
        ],
      };
    } else {
      where = obj;
    }

    const total = await this.prismaService.file.count({
      where,
    });
    const data = await this.prismaService.file.findMany({
      skip,
      take: limit,
      where,
      include: {
        user: true,
        folder: true,
        sharedFiles: {
          include: {
            sharedWith: true,
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

  async findLatest(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.userFileAccess.count({
      where: {
        userId: user.id,
      },
    });
    const data = (await this.prismaService.userFileAccess.findMany({
      skip,
      take: limit,
      where: {
        userId: user.id,
      },
      select:{
        file: {
          include: {
            folder: true,
            sharedFiles: {
              include: {
                sharedWith: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })).map(item => item.file);

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
    const data = await this.prismaService.file.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        folder: true,
        sharedFiles: true,
      },
    });
    if (!data) {
      throw new NotFoundException('File does not exist');
    }
    if (data.userId !== user.id && data.folder?.isHidden) {
      const userfound: boolean =
        data.sharedFiles.filter((x) => x.sharedWithId === user.id).length > 0;

      if (!userfound) {
        throw new NotFoundException("You don't have access");
      }
    }
    return data;
  }

  async findFilesSharedWithMe(user: User, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }
    const total = await this.prismaService.file.count({
      where: {
        sharedFiles: {
          some: {
            sharedWithId: user.id,
          },
        },
      },
    });
    const data = await this.prismaService.file.findMany({
      skip,
      take: limit,
      where: {
        sharedFiles: {
          some: {
            sharedWithId: user.id,
          },
        },
      },
      include: {
        user: true,
        sharedFiles: {
          include: {
            sharedWith: true,
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

  async update(id: string, updateFileInput: UpdateFileInput) {
    const fileExists = await this.prismaService.file.findUnique({
      where: {
        id,
      },
    });

    if (!fileExists) {
      throw new NotFoundException('File does not exist');
    }

    if (updateFileInput.folderId) {
      const data = await this.prismaService.folder.findFirst({
        where: {
          userId: fileExists.userId,
          id: updateFileInput.folderId,
        },
      });
      if (!data) {
        throw new NotFoundException('Folder does not exist');
      }
    }

    const duplicate = await this.prismaService.file.findFirst({
      where: {
        userId: fileExists.userId,
        name: updateFileInput.name,
        folderId: updateFileInput.folderId,
      },
      include: {
        folder: true,
      },
    });
    if (duplicate) {
      throw new BadRequestException(
        `File ${updateFileInput.name} already exist in ${
          duplicate.folder?.name || 'your drive'
        }`,
      );
    }

    return this.prismaService.file.update({
      where: {
        id,
      },
      data: {
        name: updateFileInput.name,
        folderId: updateFileInput.folderId,
      },
    });
  }

  async remove(user: User, id: string, token: string) {
    const fileExists = await this.prismaService.file.findUnique({
      where: {
        id,
      },
    });

    if (!fileExists) {
      throw new NotFoundException('File does not exist');
    }

    if (fileExists.userId !== user.id) {
      throw new BadRequestException(
        'Cannot delete file. File does not belong to current user',
      );
    }
    const data = await this.prismaService.file.delete({
      where: {
        id,
      },
    });
    await this.fileUploadService.delete(data.filePath, token);
    await this.prismaService.userFileAccess.deleteMany({
      where: {
        fileId: id,
      },
    });

    this.eventEmitter.emit('document.delete', { type: 'document.delete', data: { user, file:data } });

    return data;
  }

  async shareFile(user: User, sharedWithId: string, id: string) {
    const fileExists = await this.prismaService.file.findUnique({
      where: { id },
    });

    if (!fileExists) {
      throw new NotFoundException('File does not exist');
    }

    if (fileExists.userId !== user.id) {
      throw new BadRequestException(
        'Cannot share file. File does not belong to current user',
      );
    }

    if (sharedWithId === user.id) {
      throw new BadRequestException(
        'Cannot share file. File already belong to current user',
      );
    }
    const userExist = await this.prismaService.user.findUnique({
      where: { id: sharedWithId },
    });

    if (!userExist) {
      throw new NotFoundException('User does not exist');
    }

    const fileSharedWithExactUser = await this.prismaService.sharedFile.findFirst(
      {
        where: {
          fileId: id,
          sharedWithId,
        },
      },
    );

    if (fileSharedWithExactUser) {
      throw new NotFoundException(
        'File has been shared previously with this user',
      );
    }

    await this.prismaService.sharedFile.create({
      data: {
        fileId: id,
        sharedWithId,
      },
    });

    return true;
  }

  async findNewStudentMaterial(user: User) {

    if (user.role !== Roles.STUDENT) {
      throw new ForbiddenException('You are not a student');
    }
    const courses = await this.prismaService.studentToCourse.findMany({
      where: {
        studentId: user.id,
      }
    });

    const courseIds = courses.map((course) => course.courseId);

    const teachers = await this.prismaService.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
      },
    });

    const teacherIds = teachers.map((teacher) => teacher.teacherId);

    const date = new Date(new Date().setHours(0, 0, 0, 0));

    const types = [FileType.CourseAssignmentFile, FileType.CourseMaterialFile];

    const files = await this.prismaService.file.count({
      where: {
        userId: {
          in: teacherIds,
        },
        type: {
          in: types,
        },
        updatedAt: {
          gte: date,
        },
      },
    });

    return files;
  }
}
