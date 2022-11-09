import { InputType, Field } from '@nestjs/graphql';
import { Day } from 'src/common/enums/fileType.enum copy';

@InputType()
export class CreateScheduleInput {

  @Field()
  title: string;

  @Field({nullable:true})
  subtitle: string;

  @Field({nullable:true})
  color: string;

  @Field()
  description: string;

  @Field(() => [String])
  day: string[];

  @Field()
  startingTime: Date;

  @Field()
  endingTime: Date;
}
