import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Public } from 'src/common/decorators/skipAuth.decorator';
import { CreateSupportInput } from './dto/create-support.input';
import { Support } from './entities/support.entity';
import { SupportService } from './support.service';

@Resolver(() => Support)
export class SupportResolver {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly supportService: SupportService) {}

  @Mutation(() => Support)
  @Public()
  contactSupport(
    @Args('createSupportInput') createSupportInput: CreateSupportInput,
  ) {
    return this.supportService.contact(createSupportInput);
  }
}
