/* eslint-disable max-len */
/* eslint-disable max-statements */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Injectable, ForbiddenException, NotFoundException, ConsoleLogger } from '@nestjs/common';
import * as FormData from 'form-data';
import { FileUploadService } from '../../fileUpload/fileUpload.service';
import { FileType } from '../../common/enums/fileType.enum';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { PrismaService } from '../../database/services/prisma.service';
import { MAX_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { User } from '../users/entities/user.entity';
import { CreateDistrictInput } from './dto/create-district.input';
import { UpdateDistrictInput } from './dto/update-district.input';
import { Roles } from '@prisma/client';
@Injectable()
export class DistrictService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService
  ) {}

  async findMany(skip: number, limit: number) {
    if (limit > MAX_PAGINATION_ITEM_NUMBER) {
      limit = MAX_PAGINATION_ITEM_NUMBER;
    }

    const total = await this.prismaService.district.count({});
    const data = await this.prismaService.district.findMany({
      include: {
        address: true,
        users: true,
        schools: true,
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

  async findManyStatistics(skip: number, limit: number) {
    const result = await this.findMany(skip, limit);
    const data = result.data.map(district => {
      let studentCount = 0;
      let teacherCount = 0;
      let parentCount = 0;
      const schoolCount = district.schools.length;
      let SACount = 0;
      let DACount = 0;
      let PDACount = 0;

      district.users.map(user => {
        if (user.role === Roles.STUDENT) {
          studentCount++;
        } else if (user.role === Roles.TEACHER) {
          teacherCount++;
        } else if (user.role === Roles.PARENT) {
          parentCount++;
        } else if (user.role === Roles.DA) {
          DACount++;
        } else if (user.role === Roles.PDA) {
          PDACount++;
        } else if (user.role === Roles.SA) {
          SACount++;
        }
      });
      return {...district, studentCount, teacherCount, parentCount,
         schoolCount, SACount, DACount, PDACount};
    });

    return {
      data,
      pageInfo: result.pageInfo,
    };
  }

  async findDistrictStatistics(user: User,districtId:string) {

    if (user.role !== Roles.CCSA && user.role !== Roles.CSA && user.role !== Roles.PDA && user.role !== Roles.DA) {
      throw new ForbiddenException('You are not allowed');
    }

    if ((user.role === Roles.PDA || user.role === Roles.DA) && (user.districtId !== districtId)) {
      throw new ForbiddenException('You are not allowed');
    }

    const district = await this.prismaService.district.findUnique({
      where: {
        id: districtId,
      },
      include: {
        users: true,
        schools: true,
      },
    });

    if (!district) {
      throw new NotFoundException('District does not exist');
    }

    let studentCount = 0;
    let teacherCount = 0;
    let parentCount = 0;
    const schoolCount = district.schools.length;
    let SACount = 0;
    let DACount = 0;
    let PDACount = 0;

    district.users.map(user => {
      if (user.role === Roles.STUDENT) {
        studentCount++;
      } else if (user.role === Roles.TEACHER) {
        teacherCount++;
      } else if (user.role === Roles.PARENT) {
        parentCount++;
      } else if (user.role === Roles.DA) {
        DACount++;
      } else if (user.role === Roles.PDA) {
        PDACount++;
      } else if (user.role === Roles.SA) {
        SACount++;
      }
    });


    return {...district, studentCount, teacherCount, parentCount,
      schoolCount, SACount, DACount, PDACount};
  }

  async findOne(user: User, id: string) {
    if (user.districtId !== id) {
      throw new ForbiddenException('You are not authorized');
    }

    return this.prismaService.district.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
      },
    });
  }

  async update(
    id: string,
    updateDistrictInput: UpdateDistrictInput,
    token:string
  ) {
    const data = await this.prismaService.district.update({
      where: {
        id,
      },
      data: {
        name: updateDistrictInput.name,
        address: {
          update: { ...updateDistrictInput.address },
        },
      },
    });

    if (updateDistrictInput.banner || updateDistrictInput.logo) {
      const {urls} = await this.uploadFiles(
        updateDistrictInput.banner && updateDistrictInput.logo ?
        [updateDistrictInput.banner,updateDistrictInput.logo]
        : updateDistrictInput.banner ? [updateDistrictInput.banner]
        : [updateDistrictInput.logo],
        token,
        id
      );

      const updateObj = updateDistrictInput.banner &&
      updateDistrictInput.logo  ? {
        banner: urls[0],
        logo: urls[1],
      } : updateDistrictInput.banner ? {
        banner: urls[0],
      } : {
        logo: urls[0],
      };

      await this.prismaService.district.update({
        where: {
          id,
        },
        data: updateObj,
      });

      let filesToRemove = null;
      if (updateDistrictInput.banner && updateDistrictInput.logo) {
        if (data.banner || data.logo){
          filesToRemove = data.banner && data.logo ?
          [data.banner,data.logo]
          : data.banner ? [data.banner]
          : [data.logo];
        }
        data.banner = urls[0];
        data.logo = urls[1];
      } else if (updateDistrictInput.banner) {
        if (data.banner){
          filesToRemove = [data.banner];
        }
        data.banner = urls[0];
      } else {
        if (data.logo){
          filesToRemove = [data.logo];
        }
        data.logo = urls[0];
      }

      if (filesToRemove){
        await this.removeFiles(
          filesToRemove,
          token
        );
      }
    }
    if (
      (updateDistrictInput.removeBanner ||
      updateDistrictInput.removeLogo) &&
      (data.banner || data.logo)
    ) {
      let filesToRemove = null;
      let updateObj = {};
      if (updateDistrictInput.removeBanner && updateDistrictInput.removeLogo) {
        filesToRemove = [data.banner,data.logo];
        data.banner = null;
        data.logo = null;
        updateObj = { banner: null, logo: null };
      } else if (updateDistrictInput.removeBanner) {
        filesToRemove = [data.banner];
        data.banner = null;
        updateObj = { banner: null };
      } else {
        filesToRemove = [data.logo];
        data.logo = null;
        updateObj = { logo: null };
      }

      if (filesToRemove){
        await this.removeFiles(
          filesToRemove,
          token
        );
      }

      await this.prismaService.district.update({
        where: {
          id,
        },
        data: updateObj,
      });
    }
    return data;
  }

  async remove(id: string,token:string) {

    const districtExist = await this.prismaService.district.findUnique({
      where: { id },
    });
    if (!districtExist) {
      throw new NotFoundException('District does not exist');
    }

    const data = await this.prismaService.district.delete({
      where: {
        id,
      },
    });

    if (data.banner || data.logo){
      await this.removeFiles(
        data.banner && data.logo ? [data.banner,data.logo]
        : [data.banner || data.logo],
        token
      );
    }

    return data;
  }

  async create(createDistrictInput: CreateDistrictInput,token:string) {
    const createObj = {...createDistrictInput,banner:undefined,logo:undefined};
    const data = await this.prismaService.district.create({
      data: {
        ...createObj,
        address: {
          create: { ...createDistrictInput.address },
        },
      },
    });

    if (createDistrictInput.banner || createDistrictInput.logo) {
      const {urls} = await this.uploadFiles(
        createDistrictInput.banner && createDistrictInput.logo ?
        [createDistrictInput.banner,createDistrictInput.logo]
        : createDistrictInput.banner ? [createDistrictInput.banner]
        : [createDistrictInput.logo],
        token,
        data.id
      );
      const updateObj = createDistrictInput.banner &&
      createDistrictInput.logo  ? {
        banner: urls[0],
        logo: urls[1],
      } : createDistrictInput.banner ? {
        banner: urls[0],
      } : {
        logo: urls[0],
      };

      await this.prismaService.district.update({
        where: {
          id: data.id,
        },
        data: updateObj,
      });
      data.banner = urls[0];
      data.logo = urls[1];
    }

    return data;
  }
  async uploadFiles(files: GraphQLUpload[],token:string,userId:string):
   Promise<{urls:string[]}> {


    const formData = new FormData();

    formData.append('path',
      await this.fileUploadService.getDynamicFilePath(
        FileType.DistrictFiles,null,userId
      )
    );
    formData.append('public', 'true');

    for (const file of files){
      const {
        createReadStream,
        mimetype,
        filename
      } = (await file);

      formData.append('files', createReadStream(),{
        filename,
        contentType: mimetype
      });
    }

    const {urls} = await this.fileUploadService.upload(formData,token,true);

    return {urls};
  }
  async removeFiles(
    files: string[],
    token:string
  ) {
    const deleteMultiple = files.length>1;
    const paths =  deleteMultiple ?
    files.map((file) => {
      return file.split(
        process.env.FILE_API_CDN_URL+'/'
      )[1];
    }):[files[0]];

    await this.fileUploadService.delete(
      paths.join('&paths='),
      token,
      deleteMultiple
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async getDistrictGradeStatistics(user: User) {
    if (user.role !== Roles.DA) {
      throw new ForbiddenException('You are not allowed');
    };

    const firstDay = new Date(new Date().getFullYear() - 1, 11, 31);
    const lastDay = new Date(new Date().getFullYear() + 1, 0, 1);

    const result = new Array(12).fill({}).map((_, i) => {
      return { month: i+1, percentage: 0 };
    });

    const data = await this.prismaService.district.findUnique({
      where: {
        id: user.districtId,
      },
      include: {
        schools: true,
      }
    });

    const schoolIds = data.schools.map((school) => school.id);

    const courses = await this.prismaService.course.findMany({
      where: {
        schoolId: {
          in: schoolIds,
        },
      }
    });

    const courseIds = courses.map((course) => course.id);

    const grades = await this.prismaService.grade.groupBy({
      where: {
        courseId: {
          in: courseIds,
        },
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      by: ['createdAt'],
      _avg: {
        percentage: true,
      }
    });

     grades.forEach((item) => {
      const day = new Date(item.createdAt);
      const month = day.getMonth();
      result[month].percentage += item._avg.percentage;
    });

    return result;
  }
}
