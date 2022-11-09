import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Action } from '../ability/ability.factory';
import { AddGroupMemberInput } from './dto/add-group-member.input';
import { AddGroupModeratorInput } from './dto/add-group-moderator.input';
import { CreateGroupInput } from './dto/create-group.input';
import { LeaveGroupInput } from './dto/leave-group.input';
import { TransferGroupAdminInput } from './dto/transfer-group-admin.input';
import { UpdateGroupInput } from './dto/update-group.input';
import { Group } from './entities/group.entity';
import { GroupService } from './group.service';

@Resolver(() => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation(() => Group)
  @CheckAbilities({ action: Action.Create, subject: Group })
  createGroup(
    @CurrentUser() user,
    @Args('createGroupInput') createGroupInput: CreateGroupInput,
  ) {
    return this.groupService.create(user, createGroupInput);
  }

  @Mutation(() => Group)
  @CheckAbilities({ action: Action.Update, subject: Group })
  transferGroupAdmin(
    @CurrentUser() user,
    @Args('transferGroupAdminInput')
    transferGroupAdminInput: TransferGroupAdminInput,
  ) {
    return this.groupService.transferAdmin(user, transferGroupAdminInput);
  }

  @Mutation(() => Group)
  @UseGuards(AuthGuard)
  leaveGroup(
    @CurrentUser() user,
    @Args('leaveGroupInput') leaveGroupInput: LeaveGroupInput,
  ) {
    return this.groupService.leave(user, leaveGroupInput);
  }

  @Mutation(() => Group)
  @CheckAbilities({ action: Action.Update, subject: Group })
  addGroupModerator(
    @Args('addGroupModeratorInput')
    addGroupModeratorInput: AddGroupModeratorInput,
  ) {
    return this.groupService.addModerator(addGroupModeratorInput);
  }

  @Mutation(() => Group)
  @CheckAbilities({ action: Action.Update, subject: Group })
  updateGroup(@Args('updateGroupInput') updateGroupInput: UpdateGroupInput) {
    return this.groupService.update(updateGroupInput);
  }

  @Mutation(() => Group)
  @UseGuards(AuthGuard)
  addGroupMember(
    @CurrentUser() user,
    @Args('addGroupMemberInput') addGroupMemberInput: AddGroupMemberInput,
  ) {
    return this.groupService.addMember(user, addGroupMemberInput);
  }
}
