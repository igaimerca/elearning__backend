/* eslint-disable max-len */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { User } from '../users/entities/user.entity';
import { CreateInterestOrSkillInput } from './dto/create-interest-skill.input';
import { InterestsAndSkillsService } from './interests-and-skills.service';
import { InterestOrSkill } from './entities/interest-skill.entity';

@Resolver(() => InterestOrSkill )
export class InterestsAndSkillsResolver {
    // eslint-disable-next-line no-unused-vars
    constructor(private readonly interestAndSkillsService:InterestsAndSkillsService) { }

    @Mutation(() => InterestOrSkill)
    createInterestOrSkill(
        @CurrentUser() user: User,
        @Args('createInterestOrSkillInput') createInterestOrSkillInput: CreateInterestOrSkillInput,
    ) {
        return this.interestAndSkillsService.createInterestOrSkill(user,createInterestOrSkillInput);
    }

    @Query(() => [InterestOrSkill], {name: 'interestsAndSkills'})
    getInterestsAndSkills(
        @CurrentUser() user:User
    ){
        return this.interestAndSkillsService.getInterestsAndSkills(user);
    }
}
