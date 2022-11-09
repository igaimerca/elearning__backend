/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateErrorInput } from './dto/create-error.input';
import { UpdateErrorInput } from './dto/update-error.input';
import { Error } from './entities/error.entity';
import { ErrorService } from './error.service';

@Resolver(() => Error)
export class ErrorResolver {
  constructor(private readonly errorService: ErrorService) {}

  @Mutation(() => Error)
  createError(@Args('createErrorInput') createErrorInput: CreateErrorInput) {
    return this.errorService.create(createErrorInput);
  }

  @Query(() => [Error], { name: 'error' })
  findAll() {
    return this.errorService.findAll();
  }

  @Query(() => Error, { name: 'error' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.errorService.findOne(id);
  }

  @Mutation(() => Error)
  updateError(@Args('updateErrorInput') updateErrorInput: UpdateErrorInput) {
    return this.errorService.update(updateErrorInput.id, updateErrorInput);
  }

  @Mutation(() => Error)
  removeError(@Args('id', { type: () => Int }) id: number) {
    return this.errorService.remove(id);
  }
}
