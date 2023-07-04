import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export function Pagination<TItem>(TItemClass: Type<TItem>) {
  // `isAbstract` decorator option is necessary to prevent creating a `Pagination` type in schema
  @ObjectType({ isAbstract: true })
  abstract class PaginationClass {
    @Field(() => Int, {
      nullable: false,
      description: 'Count of the total number of items available',
    })
    count: number;

    @Field(() => Int, { nullable: false, description: 'Current page number.' })
    page: number;

    @Field(() => Int, { nullable: false, description: 'Amount of results available in one page.' })
    pageLength: number;

    @Field(() => Int, { nullable: false, description: 'Total of pages available.' })
    totalPages: number;

    @Field(() => [TItemClass], { nullable: true, description: 'Array with the results.' })
    results: TItem[];
  }
  return PaginationClass;
}
