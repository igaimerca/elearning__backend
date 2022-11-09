import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NoteService } from './note.service';
import { Note } from './entities/note.entity';
import { CreateNoteInput } from './dto/create-note.input';
import { UpdateNoteInput } from './dto/update-note.input';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CheckAbilities } from 'src/common/decorators/abilities.decorator';
import { Action } from '../ability/ability.factory';
import { User } from '../users/entities/user.entity';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from 'src/utils/constants';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Notes } from './entities/notes.entity';

@Resolver(() => Note)
export class NoteResolver {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly noteService: NoteService) {}

  @Mutation(() => Note)
  @CheckAbilities({ action: Action.Create, subject: Note })
  createNote(
    @CurrentUser() user: User,
    @Args('createNoteInput') createNoteInput: CreateNoteInput,
  ) {
    return this.noteService.create(user, createNoteInput);
  }

  @Query(() => Notes, { name: 'notes' })
  @UseGuards(AuthGuard)
  findMany(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.noteService.findMany(user, skip, limit);
  }

  @Query(() => Note, { name: 'note' })
  findOne(@Args('id') id: string) {
    return this.noteService.findOne(id);
  }

  @Mutation(() => Note)
  @CheckAbilities({ action: Action.Update, subject: Note })
  updateNote(@Args('updateNoteInput') updateNoteInput: UpdateNoteInput) {
    return this.noteService.update(updateNoteInput.id, updateNoteInput);
  }

  @Mutation(() => Note)
  removeNote(@CurrentUser() user: User, @Args('id') id: string) {
    return this.noteService.remove(user, id);
  }

  @Mutation(() => Boolean)
  shareNote(
    @Args('sharedWithId') sharedWithId: string,
    @Args('id') id: string,
  ) {
    return this.noteService.shareNote(sharedWithId, id);
  }

  @Query(() => Notes, { name: 'notes' })
  @UseGuards(AuthGuard)
  findNotesSharedWithMe(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.noteService.findNotesSharedWithMe(user, skip, limit);
  }

  @Query(() => Notes)
  findPinnedPrivateNotes(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.noteService.findPinnedPrivateNotes(user, skip, limit);
  }

  @Query(() => Notes)
  findUnPinnedPrivateNotes(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.noteService.findUnPinnedPrivateNotes(user, skip, limit);
  }

  @Query(() => Notes)
  findPinnedPublicNotes(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.noteService.findPinnedPublicNotes(user, skip, limit);
  }

  @Query(() => Notes)
  findUnPinnedPublicNotes(
    @CurrentUser() user: User,
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.noteService.findUnPinnedPublicNotes(user, skip, limit);
  }
}
