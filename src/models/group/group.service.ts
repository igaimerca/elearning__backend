import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../../database/services/prisma.service';
import { CreateGroupInput } from './dto/create-group.input';
import { TransferGroupAdminInput } from './dto/transfer-group-admin.input';
import { UpdateGroupInput } from './dto/update-group.input';
import { User } from '../users/entities/user.entity';
import { LeaveGroupInput } from './dto/leave-group.input';
import { AddGroupModeratorInput } from './dto/add-group-moderator.input';
import { AddGroupMemberInput } from './dto/add-group-member.input';
import { MAX_MODERATOR_NUMBER, MAX_MEMBER_NUMBER } from '../../utils/constants';

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: PrismaService) {}

  create(user: User, createGroupInput: CreateGroupInput) {
    return this.prismaService.group.create({
      data: {
        ...createGroupInput,
        adminId: user.id,
      },
    });
  }

  async transferAdmin(
    user: User,
    transferGroupAdminInput: TransferGroupAdminInput,
  ) {
    const groupExists = await this.prismaService.group.findUnique({
      where: {
        id: transferGroupAdminInput.id,
      },
      include: { members: true },
    });

    if (!groupExists) {
      throw new NotFoundException(
        `Group with ID ${transferGroupAdminInput.id} not found`,
      );
    }

    const memberExists = groupExists.members.find(
      (groupUser) => groupUser.userId === transferGroupAdminInput.userId,
    );

    if (!memberExists) {
      throw new ForbiddenException(
        `User with ID ${transferGroupAdminInput.userId} is not a member`,
      );
    }

    // The original admin will be transfered to a member
    await this.prismaService.groupUser.create({
      data: {
        userId: user.id,
        groupId: transferGroupAdminInput.id,
        moderator: false,
      },
    });

    // Removes the new admin from the members list
    await this.prismaService.groupUser.delete({
      where: { id: memberExists.id },
    });

    return this.prismaService.group.update({
      where: { id: transferGroupAdminInput.id },
      data: {
        adminId: transferGroupAdminInput.userId,
      },
    });
  }

  async leave(user: User, leaveGroupInput: LeaveGroupInput) {
    const groupExists = await this.prismaService.group.findUnique({
      where: {
        id: leaveGroupInput.id,
      },
      include: { members: true },
    });

    if (!groupExists) {
      throw new NotFoundException(
        `Group with ID ${leaveGroupInput.id} not found`,
      );
    }

    if (groupExists.adminId === user.id) {
      throw new ForbiddenException('Group admin can not leave the group');
    }

    const newMembers = groupExists.members.filter(
      (groupUser) => groupUser.userId !== user.id,
    );

    return this.prismaService.group.update({
      where: { id: leaveGroupInput.id },
      data: {
        members: {
          set: newMembers,
        },
      },
    });
  }

  async addModerator(addGroupModeratorInput: AddGroupModeratorInput) {
    const groupExists = await this.prismaService.group.findUnique({
      where: {
        id: addGroupModeratorInput.id,
      },
      include: { members: true },
    });

    const moderators = groupExists.members.filter(
      (groupUser) => groupUser.moderator,
    );

    if (moderators.length > MAX_MODERATOR_NUMBER) {
      throw new ForbiddenException(
        'Up to 10 members of a group can be a group moderators',
      );
    }

    const memberExists = groupExists.members.find(
      (groupUser) => groupUser.userId === addGroupModeratorInput.userId,
    );

    if (!memberExists) {
      throw new ForbiddenException(
        `User with ID ${addGroupModeratorInput.userId} is not a member`,
      );
    }

    return this.prismaService.groupUser.update({
      where: { id: memberExists.id },
      data: {
        moderator: true,
      },
    });
  }

  update(updateGroupInput: UpdateGroupInput) {
    return this.prismaService.group.update({
      where: { id: updateGroupInput.id },
      data: {
        ...updateGroupInput,
      },
    });
  }

  async addMember(user: User, addGroupMemberInput: AddGroupMemberInput) {
    const groupExists = await this.prismaService.group.findUnique({
      where: {
        id: addGroupMemberInput.id,
      },
      include: { members: true },
    });

    if (!groupExists) {
      throw new NotFoundException(
        `Group with ID ${addGroupMemberInput.id} not found`,
      );
    }

    const moderator = groupExists.members.find(
      (groupUser) => groupUser.moderator && groupUser.userId === user.id,
    );

    if (groupExists.adminId !== user.id && !moderator) {
      throw new UnauthorizedException(
        `User with ID ${user.id} can not add the member`,
      );
    }

    if (groupExists.members.length >= MAX_MEMBER_NUMBER) {
      throw new ForbiddenException('Up to 200 members can be in a group');
    }

    if (groupExists.adminId === addGroupMemberInput.userId) {
      throw new ConflictException('Group admin can not be a member');
    }

    const member = groupExists.members.find(
      (groupUser) => groupUser.userId === addGroupMemberInput.userId,
    );

    if (member) {
      throw new ConflictException(
        `User with ID ${addGroupMemberInput.userId} is a member already`,
      );
    }

    return this.prismaService.groupUser.create({
      data: {
        userId: addGroupMemberInput.userId,
        groupId: addGroupMemberInput.id,
        moderator: false,
      },
    });
  }
}
