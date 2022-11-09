import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { FolderService } from './folder.service';
import { Folder } from './entities/folder.entity';
import { CreateFolderInput } from './dto/create-folder.input';
import { UpdateFolderInput } from './dto/update-folder.input';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { User } from '../users/entities/user.entity';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from 'src/utils/constants';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Folders } from './entities/folders.entity';

@Resolver(() => Folder)
export class FolderResolver {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly folderService: FolderService) {}

  @Mutation(() => Folder)
  @UseGuards(AuthGuard)
  createFolder(
    @CurrentUser() user: User,
    @Args('createFolderInput') createFolderInput: CreateFolderInput,
  ) {
    return this.folderService.create(user, createFolderInput);
  }

  @Query(() => Folders, { name: 'folders' })
  @UseGuards(AuthGuard)
  findMany(
    @CurrentUser() user: User,
    @Args('parentFolderId', { defaultValue: null }) parentFolderId: string,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.folderService.findMany(user,parentFolderId, skip, limit);
  }

  @Query(() => Folder, { name: 'folder' })
  @UseGuards(AuthGuard)
  findOne(@CurrentUser() user: User,@Args('id') id: string) {
    return this.folderService.findOne(user,id);
  }

  @Mutation(() => Folder)
  @UseGuards(AuthGuard)
  updateFolder(@Args('updateFolderInput') updateFolderInput: UpdateFolderInput) {
    return this.folderService.update(updateFolderInput.id, updateFolderInput);
  }

  @Mutation(() => Folder)
  @UseGuards(AuthGuard)
  removeFolder(@CurrentUser() user: User, @Args('id') id: string) {
    return this.folderService.remove(user, id);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  shareFolder(
    @CurrentUser() user: User,
    @Args('sharedWithId') sharedWithId: string,
    @Args('id') id: string,
  ) {
    return this.folderService.shareFolder(user, sharedWithId, id);
  }

  @Query(() => Folders, { name: 'sharedFolders' })
  @UseGuards(AuthGuard)
  findFoldersSharedWithMe(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.folderService.findFoldersSharedWithMe(user, skip, limit);
  }
}
