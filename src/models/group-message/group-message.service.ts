import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FileUploadService } from 'src/fileUpload/fileUpload.service';
import { PrismaService } from '../../database/services/prisma.service';
import { User } from '../users/entities/user.entity';
import { CreateGroupMessageInput } from './dto/create-group-message.input';
import { CreateMessageGroupInput } from './dto/create-message-group';
import { UpdateMessageGroupInput } from './dto/upda-message-group';
import { UpdateGroupMessageInput } from './dto/update-group-message.input';
import * as FormData from 'form-data';
import { FileType } from '../../common/enums/fileType.enum';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@Injectable()
export class GroupMessageService {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly prismaService: PrismaService,
     // eslint-disable-next-line no-unused-vars
     private readonly fileUploadService: FileUploadService) {}

  async create(
    userId: string,
    createGroupMessageInput: CreateGroupMessageInput,
    token?:string,
    file?:GraphQLUpload
  ) {
    const result = await this.prismaService.groupMessage.create({
      data: {
        ...createGroupMessageInput,
        userId,
      },
    });

    if (file){
      const {
        createReadStream,
        mimetype,
        filename
      } = file;

      const formData = new FormData();
      formData.append('file', createReadStream(),{
        filename,
        contentType: mimetype
      });
      formData.append('path',
      await this.fileUploadService.getDynamicFilePath(
        FileType.ChatUserMessageGroup,
        userId,
        `${result.messageGroupId}/Messages/${result.id}`
        )
      );
      formData.append('public', 'false');

      const {url} = await this.fileUploadService.upload(formData,token);

      await this.prismaService.groupMessage.update({
        where: {
          id: result.id
        },
        data:{
          filePath: url
        }
      });
      result.filePath = url;
    }

    return result;
  }

  findAll(user: User) {
    return this.prismaService.userMessageGroup.findMany({
      where: {
        users: {
          some: {
            userId: user.id,
          },
        },
      },
    });
  }

  async findOneGroup(id: string) {
    const message = await this.prismaService.userMessageGroup.findUnique({
      where: {
        id,
      },
    });

    if (!message) {
      throw new NotFoundException(`GroupMessage with id ${id} not found`);
    }

    return message;
  }

  updateMessage(id: string, updateGroupMessageInput: UpdateGroupMessageInput) {
    return `This action updates a #${id} groupMessage`;
  }

  removeMessage(id: string) {
    return `This action removes a #${id} groupMessage`;
  }

  async createMessageGroup(
    id: string,
    createGroupMessageInput: CreateMessageGroupInput,
    token?:string,
    file?:GraphQLUpload
  ) {
    const result = await this.prismaService.userMessageGroup.create({
      data: {
        ...createGroupMessageInput,
        createdByUser: {
          connect: {
            id,
          },
        },
      },
    });

    if (file){
      const {
        createReadStream,
        mimetype,
        filename
      } = file;

      const formData = new FormData();
      formData.append('file', createReadStream(),{
        filename,
        contentType: mimetype
      });
      formData.append('path',
      await this.fileUploadService.getDynamicFilePath(
        FileType.ChatUserMessageGroup,
        id,
        result.id
        )
      );
      formData.append('public', 'true');

      const {url} = await this.fileUploadService.upload(formData,token);

      await this.prismaService.userMessageGroup.update({
        where: {
          id: result.id
        },
        data:{
          filePath: url
        }
      });
      result.filePath = url;
    }

    return result;
  }

  addUserToGroup(groupId: string, userId: string) {
    return this.prismaService.userToUserMessageGroup.create({
      data: {
        userId,
        userMessageGroupId: groupId,
      },
    });
  }

  removeUserFromGroup(groupId: string, userId: string) {
    return this.prismaService.userToUserMessageGroup.deleteMany({
      where: {
        userId,
        userMessageGroupId: groupId,
      },
    });
  }

  async deleteGroup(groupId: string,token:string) {
    const data = await this.prismaService.userMessageGroup.delete({
      where: {
        id: groupId,
      },
    });
    if (data.filePath) {
      await this.fileUploadService.delete(data.filePath,token);
    }
    return data;
  }

  async updateGroup(
    user: User,
    updateGroupInput: UpdateMessageGroupInput,
    token?:string,
    file?:GraphQLUpload
  ) {
    const groupExists = await this.prismaService.userMessageGroup.findUnique({
      where: {
        id: updateGroupInput.id,
      },
    });

    if (!groupExists) {
      throw new NotFoundException(
        `GroupMessage with id ${updateGroupInput.id} not found`,
      );
    }

    if (file){
      const {
        createReadStream,
        mimetype,
        filename
      } = file;

      const formData = new FormData();
      formData.append('file', createReadStream(),{
        filename,
        contentType: mimetype
      });
      formData.append('path',
        await this.fileUploadService.getDynamicFilePath(
          FileType.ChatUserMessageGroup,user.id,groupExists.id
        )
      );
      formData.append('public', 'true');

      const {url} = await this.fileUploadService.upload(formData,token);

      updateGroupInput.filePath = url;

      if (groupExists.filePath) {
        await this.fileUploadService.delete(groupExists.filePath,token);
      }
    }

    return this.prismaService.userMessageGroup.update({
      where: {
        id: updateGroupInput.id,
      },
      data: {
        ...updateGroupInput,
      },
    });
  }

  async deleteMessageFromGroup(id: string, userId: string,token:string) {
    const messageExist = await this.prismaService.groupMessage.findUnique({
      where: {
        id,
      },
    });

    if (!messageExist) {
      throw new NotFoundException(`GroupMessage with id ${id} not found`);
    }

    if (messageExist.userId !== userId) {
      throw new BadRequestException(
        'You are not allowed to delete this message',
      );
    }

    if (messageExist.filePath) {
      await this.fileUploadService.delete(messageExist.filePath,token);
    }

    return this.prismaService.groupMessage.delete({
      where: {
        id,
      },
    });
  }

  async updateMessageInGroup(
    userId: string,
    updateGroupInput: UpdateGroupMessageInput,
    token?:string,
    file?:GraphQLUpload
  ) {
    const message = await this.prismaService.groupMessage.findFirst({
      where: {
        id: updateGroupInput.id,
        userId
      },
    });

    if (!message) {
      throw new NotFoundException(
        `GroupMessage with id ${updateGroupInput.id} not found`,
      );
    }

    if (file){
      const {
        createReadStream,
        mimetype,
        filename
      } = file;

      const formData = new FormData();
      formData.append('file', createReadStream(),{
        filename,
        contentType: mimetype
      });
      formData.append('path',
        await this.fileUploadService.getDynamicFilePath(
          FileType.ChatUserMessageGroup,userId,
          `${message.messageGroupId}/Messages/${message.id}`
        )
      );
      formData.append('public', 'false');

      const {url} = await this.fileUploadService.upload(formData,token);

      updateGroupInput.filePath = url;

      if (message.filePath) {
        await this.fileUploadService.delete(message.filePath,token);
      }
    }

    return this.prismaService.groupMessage.update({
      where: {
        id: updateGroupInput.id,
      },
      data: {
        ...updateGroupInput,
      },
    });
  }
}
