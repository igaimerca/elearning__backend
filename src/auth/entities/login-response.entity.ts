import { Field, ObjectType } from '@nestjs/graphql';
import { UserResponse } from '../../models/users/entities/user-response.entity';

@ObjectType()
export class LoginResponse {
  @Field()
  user: UserResponse;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
