import { Field, ObjectType } from '@nestjs/graphql';
import { SearchCategories } from '../dto/search.input';

@ObjectType()
export class SearchResult {

  @Field()
  id: string;

  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  filePath: string;

  @Field()
  resultType: SearchCategories;

}
