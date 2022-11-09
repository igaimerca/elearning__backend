import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as FormData from 'form-data';
import { PrismaService } from '../database/services/prisma.service';
import { FileType } from '../common/enums/fileType.enum';

@Injectable()
export class FileUploadService {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly httpService: HttpService,
    // eslint-disable-next-line no-unused-vars
    private readonly prismaService: PrismaService,
  ) {}

  url = process.env.FILE_API_URL;

  async getDynamicFilePath(
    fileType: FileType,
    userId: string,
    nearestId?: string,
  ): Promise<string> {
    let path = 'GradeArcFiles';

    if (fileType === FileType.DistrictFiles) {
      path += `/Districts/${nearestId}`;
      return path;
    }
    if (fileType === FileType.SchoolFiles) {
      path += `/Districts/${userId}/Schools/${nearestId}`;
      return path;
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user.districtId) {
      path += `/Districts/${user.districtId}`;
    }
    if (user.schoolId) {
      path += `/Schools/${user.schoolId}`;
    }

    switch (fileType) {
      case FileType.UserDriveFile:
        path += `/Users/${userId}/GradeArcDrive`;
        break;
      case FileType.CourseMaterialFile:
        path += `/Courses/${nearestId}/Materials`;
        break;
      case FileType.ChatFile:
        path += `/Chats/DirectMessages/${nearestId}`;
        break;
      case FileType.ChatUserMessageGroup:
        path += `/Chats/UserMessageGroups/${nearestId}`;
        break;
      case FileType.CourseAssignmentFile:
        path += `/Courses/${nearestId}`;
        break;
      case FileType.UserOtherFile:
        path += `/Users/${userId}`;
        break;
      default:
        break;
    }

    return path;
  }

  async upload(
    formData: FormData,
    userToken: string,
    uploadMultiple?: boolean,
  ): Promise<{ url?: string; size?: number; urls?: string[] }> {
    try {
      const { data } = await this.httpService.axiosRef.post(
        `${this.url}/files/uploadFile${uploadMultiple ? 's' : ''}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
            Authorization: userToken,
          },
        },
      );
      return data;
    } catch (err) {
      throw new BadRequestException(
        err.response ? err.response.data.message : 'Error while uploading file',
      );
    }
  }

  async delete(
    filePath: string,
    userToken: string,
    deleteMultiple?: boolean,
  ): Promise<{ error: string }> {
    try {
      await this.httpService.axiosRef.delete(
        this.url +
          `/files/deleteFile${
            deleteMultiple
              ? `s?paths=${filePath}`
              : `?path=${filePath.split(process.env.FILE_API_CDN_URL + '/')[1]}`
          }`,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
            Authorization: userToken,
          },
        },
      );
      return { error: null };
    } catch (err) {
      return {
        error: err.response
          ? err.response.data.message
          : 'Error while deleting file',
      };
    }
  }
}
