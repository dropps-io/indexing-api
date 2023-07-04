import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { MethodService } from './method.service';
import { MethodEntity } from './entities/method.entity';
import { MethodParameterEntity } from './entities/method-parameter.entity';

@Resolver(() => MethodEntity)
export class MethodResolver {
  constructor(private methodService: MethodService) {}

  @Query(() => MethodEntity, { nullable: true })
  async method(@Args('id') id: string): Promise<MethodEntity | null> {
    return this.methodService.findById(id);
  }

  @ResolveField(() => [MethodParameterEntity], { nullable: 'items' })
  async parameters(@Parent() method: MethodEntity): Promise<MethodParameterEntity[] | null> {
    return await this.methodService.findParametersById(method.id);
  }
}
