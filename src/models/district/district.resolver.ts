/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUserToken } from 'src/common/decorators/currentUserToken.decorator';

import { CheckAbilities } from '../../common/decorators/abilities.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { DEFAULT_PAGINATION_ITEM_NUMBER } from '../../utils/constants';
import { Action } from '../ability/ability.factory';
import { User } from '../users/entities/user.entity';
import { DistrictService } from './district.service';
import { CreateDistrictInput } from './dto/create-district.input';
import { UpdateDistrictInput } from './dto/update-district.input';
import { District } from './entities/district.entity';
import { Districts } from './entities/districts.entity';
import { DistrictsStatistics } from './entities/districtsStatistics.entity';
import { DistrictStatistics } from './entities/districtStatistics.entity';
import { DistrictGradeStatistics } from './entities/districtGradeStatistics';

@Resolver(() => District)
export class DistrictResolver {
  constructor(private readonly districtService: DistrictService) { }


  // create district example in postman (with file upload)
  // key => {"query":"mutation ($banner:Upload!,$logo:Upload!){\n updateDistrict(updateDistrictInput:{banner:$banner,logo:$logo,id:\"cl5forsxt0026wwd05qol7v0x\",name:\"Igitangaza\"}){\nid\nname\nbanner\nlogo\n}\n}", "variables": { "banner": null,"logo": null}}
  // map => { "0": ["variables.banner"],"1": ["variables.logo"]}
  // 0 => pick banner
  // 1 => pick logo
  @Mutation(() => District)
  @CheckAbilities({ action: Action.Create, subject: District })
  createDistrict(
    @Args('createDistrictInput') createDistrictInput: CreateDistrictInput,
    @CurrentUserToken() token: string
  ) {
    return this.districtService.create(createDistrictInput, token);
  }

  @Query(() => Districts, { name: 'districts' })
  @CheckAbilities({ action: Action.Read, subject: District })
  findMany(
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.districtService.findMany(skip, limit);
  }

  @Query(() => DistrictsStatistics)
  @CheckAbilities({
    action: Action.Read,
    subject: DistrictsStatistics,
  })
  findManyStatistics(
    @Args('skip', { defaultValue: 0 }) skip: number,
    @Args('limit', { defaultValue: DEFAULT_PAGINATION_ITEM_NUMBER })
    limit: number,
  ) {
    return this.districtService.findManyStatistics(skip, limit);
  }

  @Query(() => DistrictStatistics)
  findDistrictStatistics(
    @CurrentUser() user: User,
    @Args('id') id: string
  ) {
    return this.districtService.findDistrictStatistics(user, id);
  }

  @Query(() => District, { name: 'district' })
  findOne(@CurrentUser() user: User, @Args('id') id: string) {
    return this.districtService.findOne(user, id);
  }

  // update district example in postman (with file upload)
  // key => {"query":"mutation ($banner:Upload!,$logo:Upload!){\n updateDistrict(updateDistrictInput:{banner:$banner,logo:$logo,id:\"cl5forsxt0026wwd05qol7v0x\",name:\"Igitangaza\"}){\nid\nname\nbanner\nlogo\n}\n}", "variables": { "banner": null,"logo": null}}
  // map => { "0": ["variables.banner"],"1": ["variables.logo"]}
  // 0 => pick banner
  // 1 => pick logo
  @Mutation(() => District)
  @CheckAbilities({ action: Action.Update, subject: District })
  updateDistrict(
    @Args('updateDistrictInput') updateDistrictInput: UpdateDistrictInput,
    @CurrentUserToken() token: string
  ) {
    return this.districtService.update(
      updateDistrictInput.id,
      updateDistrictInput,
      token
    );
  }

  @Mutation(() => District)
  @CheckAbilities({ action: Action.Delete, subject: District })
  removeDistrict(@Args('id') id: string, @CurrentUserToken() token: string) {
    return this.districtService.remove(id, token);
  }

  @Query(() => [DistrictGradeStatistics])
  getDistrictGradeStatistics(@CurrentUser() user: User) {
    return this.districtService.getDistrictGradeStatistics(user);
  }
}
