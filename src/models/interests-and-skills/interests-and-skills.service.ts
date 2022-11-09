/* eslint-disable max-len */
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/services/prisma.service';
import { User } from '../users/entities/user.entity';
import { CreateInterestOrSkillInput } from './dto/create-interest-skill.input';

@Injectable()
export class InterestsAndSkillsService {
    constructor(private readonly prismaService: PrismaService) { }

    async createInterestOrSkill(user: User, createInterestOrSkillInput: CreateInterestOrSkillInput) {
        const total = await this.prismaService.interestOrSkills.count({
            where: {
                userId: user.id,
            }
        });

        if (total >= 5) {
            throw new ForbiddenException('You can only have 5 interests or skills');
        }

        return await this.prismaService.interestOrSkills.create({
            data: {
                userId:user.id,
                title: createInterestOrSkillInput.title,
            },
        });
    }

    async getInterestsAndSkills(user: User) {
        return await this.prismaService.interestOrSkills.findMany({
            where: {
                userId: user.id,
            },
        });
    }
}
