import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ApiUsageService } from './apiUsage.service';
import { ApiUsageEntity } from "./entities/apiUsage.entity";

@Resolver(() => ApiUsageEntity)
export class ApiUsageResolver {
  constructor(private readonly apiUsageService: ApiUsageService) {}

  @Mutation(() => ApiUsageEntity)
  async createApiUsage(@Args('apiUsageData') apiUsageData: ApiUsageEntity): Promise<ApiUsageEntity> {
    return await this.apiUsageService.create(apiUsageData);
  }

  @Query(() => [ApiUsageEntity])
  async apiUsages(): Promise<ApiUsageEntity[]> {
    return await this.apiUsageService.findAll();
  }

  @Query(() => ApiUsageEntity)
  async apiUsage(@Args('id', { type: () => ID }) id: string): Promise<ApiUsageEntity | null> {
    return await this.apiUsageService.findOne(id);
  }

  @Mutation(() => ApiUsageEntity)
  async updateApiUsage(
    @Args('id', { type: () => ID }) id: string,
    @Args('apiUsageData') apiUsageData: ApiUsageEntity,
  ): Promise<ApiUsageEntity | null> {
    return await this.apiUsageService.update(id, apiUsageData);
  }

  @Mutation(() => Boolean)
  async deleteApiUsage(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return await this.apiUsageService.remove(id);
  }
}
