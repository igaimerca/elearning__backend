/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateErrorInput } from './dto/create-error.input';
import { UpdateErrorInput } from './dto/update-error.input';

@Injectable()
export class ErrorService {
  create(createErrorInput: CreateErrorInput) {
    return 'This action adds a new error';
  }

  findAll() {
    return 'This action returns all error';
  }

  findOne(id: number) {
    return 'This action returns a #${id} error';
  }

  update(id: number, updateErrorInput: UpdateErrorInput) {
    return 'This action updates a #${id} error';
  }

  remove(id: number) {
    return `This action removes a #${id} error`;
  }
}
