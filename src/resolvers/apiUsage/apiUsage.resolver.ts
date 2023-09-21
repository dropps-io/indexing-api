import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ApiUsageService } from './apiUsage.service';
import { ApiUsageEntity } from "./entities/apiUsage.entity";

@Resolver(() => ApiUsageEntity)
export class ApiUsageResolver {
  constructor(private readonly apiUsageService: ApiUsageService) {}

}
