import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { FileUploadService } from 'src/fileUpload/fileUpload.service';
import { PrismaService } from '../../database/services/prisma.service';
import { User } from '../users/entities/user.entity';
import { CreateMessageInput } from './dto/create-message.input';
import { UpdateMessageInput } from './dto/update-message.input';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import * as FormData from 'form-data';
import { FileType } from '../../common/enums/fileType.enum';

@Injectable()
export class MessageService {

  pubSub = new PubSub();

  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly prismaService: PrismaService,
    // eslint-disable-next-line no-unused-vars
    private readonly fileUploadService: FileUploadService
  ) { }


  async create(
    user: User,
    createMessageInput: CreateMessageInput,
    token?: string,
    file?: GraphQLUpload
  ) {

    const existsMessage = await this.prismaService.user.findFirst({
      where: {
        id: createMessageInput.toId
      }
    });

    if (!existsMessage) {
      throw new BadRequestException('User not found');
    }

    const result = await this.prismaService.privateMessage.create({
      data: {
        text: createMessageInput.text,
        filePath: createMessageInput.filePath,
        fromId: existsMessage.id,
        toId: user.id
      },
      include: {
        from: true,
        to: true
      }
    });

    if (file) {
      const {
        createReadStream,
        mimetype,
        filename
      } = file;

      const formData = new FormData();
      formData.append('file', createReadStream(), {
        filename,
        contentType: mimetype
      });
      formData.append('path',
        await this.fileUploadService.getDynamicFilePath(
          FileType.ChatFile,
          user.id,
          result.id
        )
      );
      formData.append('public', 'false');

      const { url } = await this.fileUploadService.upload(formData, token);

      await this.prismaService.privateMessage.update({
        where: {
          id: result.id
        },
        data: {
          filePath: url
        }
      });
      result.filePath = url;
    }

    return result;
  }


  async getMessagesBetween(user: User, userId: string) {
    return this.prismaService.privateMessage.findMany({
      orderBy: [
        {
          createdAt: 'desc'
        }
      ],
      where: {
        OR: [
          {
            OR: [
              {
                fromId: user.id,
              },
              {
                toId: userId,
              }
            ]
          }, {
            OR: [
              {
                fromId: userId,
              },
              {
                toId: user.id,
              }
            ]
          }
        ]
      },
      include: {
        to: true,
        from: true,
      },
    });
  }

  findOne(id: string) {

    const messageExists = this.prismaService.privateMessage.findUnique({
      where: {
        id,
      },
    });

    if (!messageExists) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }

    return this.prismaService.privateMessage.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: string,
    updateMessageInput: UpdateMessageInput,
    user?: User,
    token?: string,
    file?: GraphQLUpload
  ) {
    const messageExists = await this.prismaService.privateMessage.findUnique({
      where: {
        id,
      },
    });

    if (!messageExists) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }

    if (file) {
      const {
        createReadStream,
        mimetype,
        filename
      } = file;

      const formData = new FormData();
      formData.append('file', createReadStream(), {
        filename,
        contentType: mimetype
      });
      formData.append('path',
        await this.fileUploadService.getDynamicFilePath(
          FileType.ChatFile, user.id, messageExists.id
        )
      );
      formData.append('public', 'false');

      const { url } = await this.fileUploadService.upload(formData, token);

      updateMessageInput.filePath = url;

      if (messageExists.filePath) {
        await this.fileUploadService.delete(messageExists.filePath, token);
      }
    }

    return this.prismaService.privateMessage.update({
      where: {
        id,
      },
      data: {
        ...updateMessageInput,
      },
      include: {
        to: true,
        from: true,
      },
    });
  }

  async remove(id: string, token: string) {
    const messageExists = await this.prismaService.privateMessage.findUnique({
      where: {
        id,
      },
    });

    if (!messageExists) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }

    const data = await this.prismaService.privateMessage.delete({
      where: {
        id,
      },
    });
    if (data.filePath) {
      await this.fileUploadService.delete(data.filePath, token);
    }
    return data;
  }
}
