/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { CreateTimetableInput } from './dto/create-timetable.input';
import { UpdateTimetableInput } from './dto/update-timetable.input';

@Injectable()
export class TimetableService {
  create(createTimetableInput: CreateTimetableInput) {
    return 'This action adds a new timetable';
  }

  findAll() {
    return 'This action returns all timetable';
  }

  findOne(id: number) {
    return 'This action returns a #${id} timetable';
  }

  update(id: number, updateTimetableInput: UpdateTimetableInput) {
    return 'This action updates a #${id} timetable';
  }

  remove(id: number) {
    return `This action removes a #${id} timetable`;
  }
}
