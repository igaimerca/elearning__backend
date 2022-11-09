import { ObjectType, Field } from '@nestjs/graphql';
import { Day } from 'src/common/enums/fileType.enum copy';

@ObjectType()
export class Schedule {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field({nullable:true})
  subtitle: string;

  @Field({nullable:true})
  color: string;

  @Field()
  description: string;

  @Field(()=>[String], { nullable: 'itemsAndList' })
  day: string[];

  @Field()
  startingTime: Date;

  @Field()
  endingTime: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
