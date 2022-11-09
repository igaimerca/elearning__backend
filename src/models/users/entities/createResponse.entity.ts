import { Field, ObjectType } from '@nestjs/graphql';
import { ResponseStatus } from '../../../common/enums/responseStatus.enum';

@ObjectType()
export class CreateResponse {
  @Field()
  status: ResponseStatus;

  @Field()
  message: string;
}
