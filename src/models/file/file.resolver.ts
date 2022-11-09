import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { FileService } from './file.service';
import { File } from './entities/file.entity';
import { MaterialCount } from './entities/material-count.entity';
import { CreateFileInput } from './dto/create-file.input';
import { UpdateFileInput } from './dto/update-file.input';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { User } from '../users/entities/user.entity';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from 'src/utils/constants';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Files } from './entities/files.entity';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { CurrentUserToken } from '../../common/decorators/currentUserToken.decorator';


@Resolver(() => File)
export class FileResolver {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly fileService: FileService) {}

  // Example of request in postman
  // Key->Value
  // operations->{"query":"mutation ($file:Upload!){\n createFile(file:$file,createFileInput:{}){\nfilePath\nname\nid\n}\n}", "variables": { "file": null }}
  // map->{ "0": ["variables.file"] }
  // 0->pick the file

  @Mutation(() => File)
  @UseGuards(AuthGuard)
  async createFile(
    @CurrentUser() user: User,
    @Args('createFileInput') createFileInput: CreateFileInput,
    @CurrentUserToken() token: string,
    @Args({name: 'file', type: () => GraphQLUpload}) file
  ) {
    return this.fileService.create(user, createFileInput, token ,file);
  }

  @Query(() => Files, { name: 'files' })
  @UseGuards(AuthGuard)
  findMany(
    @CurrentUser() user: User,
    @Args('folderId', { defaultValue: null }) folderId: string,
    @Args('listByFolder', { defaultValue: true }) listByFolder: boolean,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.fileService.findMany(user,folderId, listByFolder, skip, limit);
  }

  @Query(() => Files, { name: 'recentFiles' })
  @UseGuards(AuthGuard)
  recent(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.fileService.findLatest(user, skip, limit);
  }

  @Query(() => File, { name: 'file' })
  @UseGuards(AuthGuard)
  findOne(@CurrentUser() user: User,@Args('id') id: string) {
    return this.fileService.findOne(user,id);
  }

  @Mutation(() => File)
  @UseGuards(AuthGuard)
  updateFile(@Args('updateFileInput') updateFileInput: UpdateFileInput) {
    return this.fileService.update(updateFileInput.id, updateFileInput);
  }

  @Mutation(() => File)
  @UseGuards(AuthGuard)
  async removeFile(@CurrentUserToken() token: string,@CurrentUser() user: User, @Args('id') id: string) {
    return await this.fileService.remove(user, id, token);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  shareFile(
    @CurrentUser() user: User,
    @Args('sharedWithId') sharedWithId: string,
    @Args('id') id: string,
  ) {
    return this.fileService.shareFile(user, sharedWithId, id);
  }

  @Query(() => Files, { name: 'sharedFiles' })
  @UseGuards(AuthGuard)
  findFilesSharedWithMe(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.fileService.findFilesSharedWithMe(user, skip, limit);
  }

  @Query(()=> MaterialCount ,{name:'NewStudentMaterialCount'})
  @UseGuards(AuthGuard)
  findNewStudentMaterials(
    @CurrentUser() user:User,
  ){
    return this.fileService.findNewStudentMaterial(user);
  }
}
