import {
  Controller,
  Get,
  Query,
  Redirect,
  Res,
  UseGuards,
} from '@nestjs/common';
import { User } from '../models/users/entities/user.entity';
import { CurrentUser } from '../common/decorators/currentUser.decorator';
import { ResponseStatus } from '../common/enums/responseStatus.enum';
import { AuthGuard } from '../common/guards/auth.guard';
import { PrismaService } from '../database/services/prisma.service';
import { FileType } from 'src/common/enums/fileType.enum';

@Controller('files')
export class FileController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly prismaService: PrismaService) {}

  url = process.env.FILE_API_URL;

  @Get('readFile')
  @UseGuards(AuthGuard)
  @Redirect()
  async readPrivateFile(
    @CurrentUser() user: User,
    @Query() query: { url: string; type: FileType },
    @Res() res,
  ) {
    const { url, type } = query;
    if (!url || !url.length) {
      return res
        .status(400)
        .send({ status: ResponseStatus.FAILURE, message: 'url is required' });
    }
    const typeError = !type
      ? 'type is required'
      : !Object.values(FileType).includes(type)
      ? 'type is invalid'
      : '';
    if (typeError.length) {
      return res
        .status(400)
        .send({ status: ResponseStatus.FAILURE, message: typeError });
    }

    if (type === FileType.UserDriveFile) {
      const data = await this.prismaService.file.findFirst({
        where: {
          filePath: url,
          OR: [
            { userId: user.id },
            {
              sharedFiles: {
                some: {
                  sharedWithId: user.id,
                },
              },
            },
            {
              folder: {
                isHidden: false,
              },
            },
          ],
        },
      });

      if (!data) {
        return res
          .status(404)
          .send({
            status: ResponseStatus.FAILURE,
            message: "You don't have access",
          });
      }
      const where = {
        userId: user.id,
        fileId: data.id,
      };
      await this.prismaService.userFileAccess.updateMany({
        where,
        data: where,
      });
    }

    return {
      url: `${this.url}/files/readFile?path=${
        url.split(process.env.FILE_API_CDN_URL + '/')[1]
      }`,
    };
  }
}
