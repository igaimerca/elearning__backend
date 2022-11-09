/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { CreateSchoolInput } from './dto/create-school.input';
import { UpdateSchoolInput } from './dto/update-school.input';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { Roles } from '@prisma/client';
import * as FormData from 'form-data';
import { FileUploadService } from '../../fileUpload/fileUpload.service';
import { FileType } from '../../common/enums/fileType.enum';

@Injectable()
export class SchoolService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) { }

  async create(createSchoolInput: CreateSchoolInput, token: string) {
    const schoolExists = await this.prismaService.school.findFirst({
      where: {
        name: createSchoolInput.name,
        districtId: createSchoolInput.districtId,
      },
    });

    if (schoolExists) {
      throw new BadRequestException('School already exists');
    }

    const data = await this.prismaService.school.create({
      data: {
        name: createSchoolInput.name,
        district: {
          connect: { id: createSchoolInput.districtId },
        },
        address: {
          create: { ...createSchoolInput.address },
        },
      },
    });

    if (createSchoolInput.banner) {
      const {
        createReadStream,
        mimetype,
        filename,
      } = await createSchoolInput.banner;

      const formData = new FormData();
      formData.append('file', createReadStream(), {
        filename,
        contentType: mimetype,
      });
      formData.append(
        'path',
        await this.fileUploadService.getDynamicFilePath(
          FileType.SchoolFiles,
          createSchoolInput.districtId,
          data.id,
        ),
      );
      formData.append('public', 'true');

      const { url } = await this.fileUploadService.upload(formData, token);

      data.banner = url;
      await this.prismaService.school.update({
        where: { id: data.id },
        data: { banner: url },
      });
    }

    return data;
  }

  async findMany(skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.school.count({});
    const data = await this.prismaService.school.findMany({
      include: {
        district: true,
        address: true,
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

  async schoolsOfDistrict(districtId: string, skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.school.count({
      where: {
        districtId,
      },
    });
    const data = await this.prismaService.school.findMany({
      where: {
        districtId,
      },
      include: {
        district: true,
        address: true,
        users: true,
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

  async findSchoolStatisticsInDistrict(
    districtId: string,
    skip: number,
    limit: number,
  ) {
    const result = await this.schoolsOfDistrict(districtId, skip, limit);
    const data = result.data.map((school) => {
      let studentCount = 0;
      let teacherCount = 0;
      let parentCount = 0;

      school.users.map((user) => {
        if (user.role === Roles.STUDENT) {
          studentCount++;
        } else if (user.role === Roles.TEACHER) {
          teacherCount++;
        } else if (user.role === Roles.PARENT) {
          parentCount++;
        }
      });
      return { ...school, studentCount, teacherCount, parentCount };
    });

    return {
      data,
      pageInfo: result.pageInfo,
    };
  }

  findOne(id: string) {
    return this.prismaService.school.findUnique({
      where: { id },
    });
  }

  // eslint-disable-next-line max-statements
  async update(updateSchoolInput: UpdateSchoolInput, token: string) {
    const schoolExists = await this.prismaService.school.findUnique({
      where: {
        id: updateSchoolInput.id,
      },
    });

    if (!schoolExists) {
      throw new NotFoundException('School does not exist');
    }

    if (updateSchoolInput.name) {
      const schoolWithExists = await this.prismaService.school.findFirst({
        where: {
          name: updateSchoolInput.name,
          districtId: updateSchoolInput.districtId,
          NOT: {
            id: updateSchoolInput.id,
          }
        },
      });

      if (schoolWithExists) {
        throw new BadRequestException('School already exists');
      }
    }
    let banner = undefined;
    if (updateSchoolInput.banner) {
      const {
        createReadStream,
        mimetype,
        filename,
      } = await updateSchoolInput.banner;

      const formData = new FormData();
      formData.append('file', createReadStream(), {
        filename,
        contentType: mimetype,
      });
      formData.append(
        'path',
        await this.fileUploadService.getDynamicFilePath(
          FileType.SchoolFiles,
          schoolExists.districtId,
          schoolExists.id,
        ),
      );
      formData.append('public', 'true');

      const { url } = await this.fileUploadService.upload(formData, token);

      banner = url;

      if (schoolExists.banner) {
        await this.fileUploadService.delete(schoolExists.banner, token);
      }
    }

    return this.prismaService.school.update({
      where: { id: updateSchoolInput.id },
      data: {
        name: updateSchoolInput.name,
        banner,
        district: {
          connect: { id: updateSchoolInput.districtId },
        },
        address: {
          update: { ...updateSchoolInput.address },
        },
      },
    });
  }

  async remove(id: string, token: string) {
    const schoolExists = await this.prismaService.school.findUnique({
      where: {
        id,
      },
    });

    if (!schoolExists) {
      throw new NotFoundException('School does not exist');
    }
    if (schoolExists.banner) {
      await this.fileUploadService.delete(schoolExists.banner, token);
    }
    return this.prismaService.school.delete({ where: { id } });
  }
}
