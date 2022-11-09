import { Field, InputType } from '@nestjs/graphql';

export enum SearchCategories {
  All = 'all',
  Class = 'class',
  Assignment = 'assignment',
  Drive = 'drive',
  Notification = 'notification',
  Test = 'test',
  Grade = 'grade',
  Attendance = 'attendance',
  Schedule = 'schedule',
  Chat = 'chat',
  Calendar = 'calendar',
  Student = 'student',
}

export enum SearchDateRange {
  OneDay = 'one day',
  ThreeDays = 'three days',
  OneWeek = 'one week',
  ThreeWeeks = 'three weeks',
  OneMonth = 'one month',
  ThreeMonths = 'three months',
}

@InputType()
export class SearchInput {
  @Field()
  query: string;

  @Field({ defaultValue: SearchCategories.All })
  category: SearchCategories;

  @Field({ nullable: true })
  dateRange: SearchDateRange;
}
