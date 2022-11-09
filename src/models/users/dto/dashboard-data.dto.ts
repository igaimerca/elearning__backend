import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DashboardDTO {
  @Field({ defaultValue: 0 })
  dueAssignments: number;

  @Field({ defaultValue: 0 })
  completedAssignments: number;

  @Field({ defaultValue: 0 })
  missedAssignments: number;

  @Field({ defaultValue: 0 })
  totalCourses: number;
}
